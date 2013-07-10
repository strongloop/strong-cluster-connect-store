var inherits = require('util').inherits;
var cluster = require('cluster');
var NativeStore = require('strong-store-cluster');

/**
 * Documentation marker for explicit setup of the shared-state server
 * in the master process. The initialization happens when this module
 * is required, thus calling this function is entirely optional.
 */
function _setup() {
  // no-op
}
/**
 * Return the `ClusterStore` extending `connect`'s session Store.
 *
 * @param {Object} connect
 * @return {function}
 */
module.exports = function(connect) {

  /**
   * Connect's Store.
   */
  var Store = connect.session.Store;

  var COLLECTION_NAME = 'strong-cluster-connect-session-store';

  /**
   * Initialize ClusterStore with the given `options`.
   *
   * @param {Object} options
   * @constructor
   * @extends {connect.session.Store}
   */
  function ClusterStore(options) {
    Store.call(this, options);
    this._collection = NativeStore.collection(COLLECTION_NAME);
  }

  inherits(ClusterStore, Store);

  /**
   * Attempt to fetch a session by the given `sid`.
   *
   * @param {string} sid
   * @param {function(?Error,Session)} fn
   */
  ClusterStore.prototype.get = function(sid, fn) {
    this._collection.get(sid, fn);
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {string} sid
   * @param {!Session} sess
   * @param {function(?Error)} fn
   */
  ClusterStore.prototype.set = function(sid, sess, fn) {
    this._collection.set(sid, sess, fn);
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {string} sid
   */
  ClusterStore.prototype.destroy = function(sid, fn){
    this._collection.del(sid, fn);
  };


  ClusterStore.setup = _setup;

  return ClusterStore;
};

module.exports.setup = _setup;
