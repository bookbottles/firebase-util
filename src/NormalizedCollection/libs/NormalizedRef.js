'use strict';

var util      = require('../../common');
var Query     = require('./Query');

function NormalizedRef(record, parent) {
  this._super(this, record);
  this._parent = parent||null;
  this._key = record.getName();
  this._toString = record.getUrl();

  this.parent = this._parent;
  this.key = this._key;

  var p = this;
  while(p.parent !== null) {
    p = p.parent;
  }
  this.root = p;
}

util.inherits(NormalizedRef, Query, {
  'child': function(fieldName) {
    var parts = fieldName.split('/').reverse(); // pop is faster than shift
    var parent = this;
    var ref = this;
    while(parts.length) {
      var key = parts.pop();
      ref = new NormalizedRef(ref.$getRecord().makeChild(key), parent);
      parent = ref;
    }
    return ref;
  },

  /** @deprecated */
  'name': function() {
    console.warn('The name() function has been deprecated. Use key instead.');
    return this.key;
  },

  'toString': function() {
    return this._toString;
  },

  //todo have set, update, push, remove attempt to revert any partial commits
  //todo by running a transaction and, if the value is still the "new" partial
  //todo value, then revert it to the old complete value

  'set': function(data, callback, context) {
    this.$getRecord().saveData(data, {callback: callback, context: context, isUpdate: false});
  },

  'update': function(data, callback, context) {
    this.$getRecord().saveData(data, {callback: callback, context: context, isUpdate: true});
  },

  'remove': function(callback, context) {
    this.$getRecord().saveData(null, {callback: callback, context: context, isUpdate: false});
  },

  'push': function(data, callback, context) { // jshint unused:false
    var uid = this.$getMaster().push().key;
    var child = this.child(uid);
    if( arguments.length ) {
      child.set.apply(child, arguments);
    }
    return child;
  },

  'setWithPriority': function(data, priority, callback, context) {
    this.$getRecord().saveData(data, {
      callback: callback, context: context, isUpdate: false, priority: priority
    });
  },

  'setPriority': function(priority, callback, context) {
    this.$getMaster().setPriority(priority, callback, context);
  },

  /****************************
   * WRAPPER FUNCTIONS
   ****************************/
  'auth': wrapMaster('auth'),
  'unauth': wrapMaster('unauth'),
  'authWithCustomToken': wrapMaster('authWithCustomToken'),
  'authAnonymously': wrapMaster('authAnonymously'),
  'authWithPassword': wrapMaster('authWithPassword'),
  'authWithOAuthPopup': wrapMaster('authWithOAuthPopup'),
  'authWithOAuthRedirect': wrapMaster('authWithOAuthRedirect'),
  'authWithOAuthToken': wrapMaster('authWithOAuthToken'),
  'getAuth': wrapMaster('getAuth'),
  'onAuth': wrapMaster('onAuth'),
  'offAuth': wrapMaster('offAuth'),
  'createUser': wrapMaster('createUser'),
  'changePassword': wrapMaster('changePassword'),
  'removeUser': wrapMaster('removeUser'),
  'resetPassword': wrapMaster('resetPassword'),
  'changeEmail': wrapMaster('changeEmail'),

  'goOffline': wrapAll('goOffline'),
  'goOnline': wrapAll('goOnline'),

  /****************************
   * UNSUPPORTED FUNCTIONS
   ***************************/
  'transaction': notSupported('transaction'), //todo use field map to pick fields and apply to each
  'onDisconnect': notSupported('onDisconnect') //todo use field map to pick fields and apply to each
});

function wrapAll(method) {
  return function() {
    var args = util.toArray(arguments);
    util.each(this.$getPaths(), function(p) {
      var ref = p.ref;
      ref[method].apply(ref, args);
    });
  };
}

function wrapMaster(method) {
  return function() {
    var args = util.toArray(arguments);
    var ref = this.$getMaster();
    return ref[method].apply(ref, args);
  };
}

function notSupported(method) {
  return function() {
    throw new Error(method + ' is not supported for NormalizedCollection references. ' +
      'Try calling it on the original reference used to create the NormalizedCollection instead.');
  };
}

module.exports = NormalizedRef;