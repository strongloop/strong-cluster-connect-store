var inherits = require('util').inherits;
var cluster = require('cluster');
var NativeStore = require('strong-store-cluster');

/**
 * Documentation marker for explicit setup of the shared-state server
 * in the master process. The initialization happens when this module
 * is required, thus calling this function is entirely optional.
 * @private
 */
function _setup() {
  // no-op
}
/**
 * Return the `ClusterStore` extending `connect`'s session Store.
 * @param {Object} connect The express or connect object.
 * @return {Object} A ClusterStore object.
 */
module.exports = function(connect) {

  /**
   * Connect's Store.
   * @private
   */
  var Store = connect.session.Store;

  var COLLECTION_NAME = 'strong-cluster-connect-session-store';

  /**
   * Initialize a ClusterStore object with the given `options`.
   * See the [strong-store-cluster](http://docs.strongloop.com/strongloop/strong-store-cluster#collectionconfigureoptions) documentation for information on the options.
   * @param {Object} options Options for the ClusterStore object.
   * @constructor
   * @extends {connect.session.Store}
   */
  function ClusterStore(options) {
    Store.call(this, options);
    this._collection = NativeStore.collection(COLLECTION_NAME);
  }

  inherits(ClusterStore, Store);

  /**
   * Fetch a session by an id and receive the session in the callback.
   * @param {String} sid A string id for the session.
   * @param {Function} fn A callback of type function(Error, Session) to receive the session.
   */
  ClusterStore.prototype.get = function(sid, fn) {
    this._collection.get(sid, fn);
  };

  /**
   * Commit the given `session` object associated with the given `sid` to the session store.
   * @param {String} sid A string id identifying the session.
   * @param {Object} session The session object.
   * @param {Function} fn A callback of type: function(Error)
   */
  ClusterStore.prototype.set = function(sid, session, fn) {
    this._collection.set(sid, session, fn);
  };

  /**
   * Destroy the session associated with the given `sid`.
   * @param {String} sid A String with the id of the session.
   * @param {Function} fn A callback of the type function(err)
   */
  ClusterStore.prototype.destroy = function(sid, fn){
    this._collection.del(sid, fn);
  };


  ClusterStore.setup = _setup;

  return ClusterStore;
};

module.exports.setup = _setup;
