var inherits = require('util').inherits;
var cluster = require('cluster');
var NativeStore = require('strong-store-cluster');

/**
 * Documentation marker for explicit setup of the shared-state server
 * in the master process. The initialization happens when this module
 * is required, thus calling this function is entirely optional.
 * @private
 */
function setup() {
  // no-op
}

/**
 * Return the `ClusterStore` constructor that can be called to create
 * a session Store to use with
 * the [express-session](https://www.npmjs.org/package/express-session)
 * middleware.
 *
 * #### Example
 * ```
 // express v3.x
 var session = express.session;
 var SessionStore = require('strong-cluster-connect-store')(session);

 // express v4.x
 var session = require('express-session');
 var SessionStore = require('strong-cluster-connect-store')(session);

 // express v3.x (backwards compatibility)
 var SessionStore = require('strong-cluster-connect-store')(express);
 * ```
 *
 * @param {Object} connectOrSession express session or connect/express itself
 * @return {function} The ClusterStore constructor.
 */
module.exports = function(connectOrSession) {

  var session = connectOrSession.session || connectOrSession;

  /**
   * Connect's Store.
   * @private
   */
  var Store = session.Store;

  var COLLECTION_NAME = 'strong-cluster-connect-session-store';

  /**
   * Initialize a ClusterStore object with the given `options`.
   * This is an internal constructor called by express-session middleware,
   * you should not need to call it directly.
   * @param {Object} options Options for the ClusterStore object.
   * @constructor
   * @extends {session.Store}
   * @ignore
   */
  function ClusterStore(options) {
    Store.call(this, options);
    this._collection = NativeStore.collection(COLLECTION_NAME);
  }

  inherits(ClusterStore, Store);

  /**
   * Fetch a session by an id and receive the session in the callback.
   * @param {String} sid A string id for the session.
   * @end
   * @callback {Function} fn
   * @param {Error} err if present, indicates an error condition.
   * @param value The data stored in the collection, could be any type.
   * @end
   * @ignore
   */
  ClusterStore.prototype.get = function(sid, fn) {
    this._collection.get(sid, fn);
  };

  /**
   * Commit the given `session` object associated with the given `sid` to the
   * session store.
   * @param {String} sid A string id identifying the session.
   * @param {Object} session The session object.
   * @end
   * @callback {Function} fn
   * @param {Error} err If defined, indicates an error occured.
   * @end
   * @ignore
   */
  ClusterStore.prototype.set = function(sid, session, fn) {
    this._collection.set(sid, session, fn);
  };

  /**
   * Destroy the session associated with the given `sid`.
   * @param {String} sid A String with the id of the session.
   * @end
   * @callback {Function} fn
   * @param {Error} err If defined, indicates an error occured.
   * @end
   * @ignore
   */
  ClusterStore.prototype.destroy = function(sid, fn){
    this._collection.del(sid, fn);
  };


  /**
   * Same as `setup()` (see above).
   * @ignore
   */
  ClusterStore.setup = setup;

  return ClusterStore;
};

module.exports.setup = setup;
