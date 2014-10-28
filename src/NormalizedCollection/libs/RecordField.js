'use strict';

var PathManager = require('./PathManager');
var FieldMap = require('./FieldMap');
var AbstractRecord = require('./AbstractRecord');
var util = require('../../common');

function RecordField(fieldMap) {
  this._super(fieldMap);
  if( fieldMap.getPathManager().count() !== 1 ) {
    throw new Error('RecordField must have exactly one path, but we got '+ fieldMap.getPathManager().count());
  }
  if( fieldMap.length !== 1 ) {
    throw new Error('RecordField must have exactly one field, but we found '+ fieldMap.length);
  }
  this.path = fieldMap.getPathManager().first();
}

util.inherits(RecordField, AbstractRecord, {
  child: function(key) {
    var pm = new PathManager([this.path.child(key)]);
    var fm = new FieldMap(pm);
    fm.add({key: FieldMap.key(pm.first(), '$value'), alias: key});
    return new RecordField(fm);
  },

  getChildSnaps: function(snaps, fieldName) {
    if( snaps.length !== 1 ) {
      throw new Error('RecordField must have exactly one snapshot, but we got '+snaps.length);
    }
    // there is exactly one snap and there are no aliases to deal with
    return [snaps[0].child(fieldName)];
  },

  /**
   * There is nothing to merge at this level because there is only one
   * path and no field map
   *
   * @param {Array} snaps list of snapshots to be merged
   * @param {boolean} isExport true if exportVal() was called
   * @returns {Object}
   */
  mergeData: function(snaps, isExport) {
    if( snaps.length !== 1 ) {
      throw new Error('RecordField must have exactly one snapshot, but we got '+snaps.length);
    }
    return isExport? snaps[0].exportVal() : snaps[0].val();
  },

  /**
   * Given a list of snapshots to iterate, returns the valid keys
   * which exist in both the snapshots and the field map, in the
   * order they should be iterated.
   *
   * Calls iterator with a {string|number} key for the next field to
   * iterate only.
   *
   * If iterator returns true, this method should abort and return true,
   * otherwise it should return false (same as Snapshot.forEach).
   *
   * @param {Array} snaps
   * @param {function} iterator
   * @param {object} [context]
   * @return {boolean} true if aborted
   * @abstract
   */
  forEachKey: function(snaps, iterator, context) {
    if( snaps.length !== 1 ) {
      throw new Error('RecordField must have exactly one snapshot, but we got '+snaps.length);
    }
    var firstSnap = snaps[0];
    return this.map.forEach(function(field) {
        if( field.id === '$key' || field.id === '$value' || firstSnap.hasChild(field.id) ) {
          return iterator.call(context, field.id) === true;
        }
        return false;
    });
  },

  _start: function(event) {
    this.path.ref().on(event, this._handler(event), this._cancel, this);
  },

  _stop:   function(event) {
    this.path.ref().off(event, this._handler(event), this);
  }
});

module.exports = RecordField;