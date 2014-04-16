var cluster = require('cluster');
var http = require('http');
var expect = require('chai').expect;
var express = require('express');
var request = require('request');
var async = require('async');

var Session = require('express-session');
var ClusterStore = require('..')(Session);
var CookieParser = require('cookie-parser');
var BodyParser = require('body-parser');

//var ClusterStore = require('..');
//var CookieParser = require('cookie-parser');
//var Session = require('express-session');
//var BodyParser = require('body-parser');

var workerUrl;

// verify we can call setup without express in master and workers
require('..').setup();

if (cluster.isWorker) {
  startExpressServer();
  return;
}

describe('clustered express server', function() {
  before(setupWorkers);
  after(stopWorkers);

  var KEY = 'a-key';
  var PAYLOAD = 'a-value';

  // NOTE We assume that the cluster does a perfect round-robin
  // distribution of requests among the workers

  it('shares sessions between workers', function(done) {
    async.series(
      [
        save,
        load
      ],
      function(err, results) {
        if (err) {
          return done(err);
        }
        expect(results.pop().value).to.equal(PAYLOAD);
        done();
      }
    );
  });

  it('destroys a session shared between workers', function(done) {
    async.series(
      [
        save,
        destroy,
        load
      ],
      function(err, results) {
        if (err) {
          return done(err);
        }
        expect(results.pop().value).to.equal(undefined);
        done();
      }
    );
  });

  function save(next) {
    sendCommand({ cmd: 'set', key: KEY, value: PAYLOAD }, next);
  }

  function destroy(next) {
    sendCommand({ cmd: 'del', key: KEY }, next);
  }

  function load(next) {
    sendCommand({ cmd: 'get', key: KEY }, next);
  }
});

function sendCommand(command, cb) {
  request(
    {
      url: workerUrl,
      method: 'POST',
      json: command
    },
    function(err, res, body) {
      if (err) {
        return cb(err);
      }
      cb(null, body);
    }
  );
}

var WORKER_COUNT = 2;

function getNumberOfWorkers() {
  return Object.keys(cluster.workers).length;
}

function setupWorkers(done) {
  if (getNumberOfWorkers() > 0) {
    var msg = 'Cannot setup workers: there are already other workers running.';
    return done(new Error(msg));
  }

  cluster.setupMaster({ exec: __filename });
  ClusterStore.setup();

  var workersListening = 0;
  cluster.on('listening', function(w, addr) {
    if (!workerUrl) workerUrl = 'http://localhost:' + addr.port;

    workersListening++;
    if (workersListening == WORKER_COUNT) {
      done();
    }
  });

  for (var i = 0; i < WORKER_COUNT; i++) {
    cluster.fork();
  }
}

function stopWorkers(done) {
  cluster.disconnect(done);
}

function startExpressServer() {
  var PORT = 0; // Let the OS pick any available port
  var app = express()
    .use(CookieParser())
    .use(Session({ store: new ClusterStore(), secret: 'a-secret' }))
    .use(BodyParser.json())
    .use(requestHandler);

  var server = http.createServer(app).listen(PORT);

  function requestHandler(req, res) {
    var result = {};
    switch (req.body.cmd) {
      case 'set':
        req.session[req.body.key] = req.body.value;
        break;
      case 'get':
        result.value = req.session[req.body.key];
        break;
      case 'del':
        req.session.destroy();
        break;
    }

    res.setHeader('Content-Type', 'text/json');
    res.end(JSON.stringify(result));
  }
}
