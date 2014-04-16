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
 * Return the `ClusterStore` constructor.
 *
 * @param {Object} express-session module as returned by `require('express-session')`.
 * @return {function} The ClusterStore constructor.
 */
module.exports = function(session) {

  /**
   * The express-session's Store.

   * @private
   */
  //var Store = require('express-session').Store;
  var Store = session.Store;

  var COLLECTION_NAME = 'strong-cluster-express-session-store';

  /**
   * Initialize a ClusterStore object with the given `options`.
   * See the
   * [strong-store-cluster](http://docs.strongloop.com/strongloop/strong-store-cluster#collectionconfigureoptions)
   * documentation for information on the options.
   * @param {Object} options Options for the ClusterStore object.
   * @constructor
   * @extends {express.session.Store}
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
   *
   */
  ClusterStore.prototype.destroy = function(sid, fn){
    this._collection.del(sid, fn);
  };


  /**
   * Same as `setup()` (see above).
   */
  ClusterStore.setup = setup;

  return ClusterStore;
};

module.exports.setup = setup;
