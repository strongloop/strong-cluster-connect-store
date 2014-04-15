# express-session store for node cluster

## Overview

strong-cluster-express-store extends the functionality of the
[express-session](https://github.com/expressjs/session) store
using node's native cluster messaging. It provides an easy way for using
sessions in express-based applications running in a node cluster.

Features:

- Supports express
- Module is shipped without express, it will use *your* version of express
- Covered by unit-tests.
 
## Installation

```sh
$ npm install strong-cluster-express-store
```

## Configuration for Express

```
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var ClusterStore = require('strong-cluster-express-store');
 
var app = express();
app
  .use(cookieParser())
  .use(session({ store: new ClusterStore(), secret: 'keyboard cat' }))
  .use(bodyParser.json());
```

## Setting up the master process

```
// The master process only executes this code
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
 
require('strong-cluster-express-store').setup();
 
// fork the workers
for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
}
// workers and master run from this point onward
 
// setup the workers
if (cluster.isWorker) {
    [...]
}
```

## Using strong-cluster-express-store

```
'use strict';
var express = require('express');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var ClusterStore = require('strong-cluster-express-store');
 
if (cluster.isMaster) {
    // The cluster master executes this code
     
    ClusterStore.setup();
   
    // Create a worker for each CPU
    for (var i=0; i<numCPUs; i++) {
        cluster.fork();
      }
   
    cluster.on('online', function(worker) {
          console.log('Worker ' + worker.id + ' is online.');
        });
   
    cluster.on('exit', function(worker, code, signal) {
          console.log('worker ' + worker.id + ' died with signal',signal);
        });
} else {
    // The cluster workers execute this code
     
    var app = express();
    app.use(express.cookieParser());
   
    app.use(express.session(
            { store: new ClusterStore(), secret: 'super-cool' }
          ));
   
    app.get('/hello', function(req, res) {
          var msg;
          if (req.session.visited)
            msg = {msg: 'Hello again from worker '+cluster.worker.id};
          else
            msg = {msg: 'Hello from worker '+cluster.worker.id};
       
          req.session.visited = '1';
          res.json(200, msg);
        });
    app.listen(8080);
}
```

## Licence

Dual MIT/StrongLoop licence

