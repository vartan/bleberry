/*jshint esnext:true*/
"use strict";
var util = require('util');
var bleno = require("bleno");
var BlenoCharacteristic = bleno.Characteristic;
var os = require('os');

// By default, treat as integer.
function _conversionToDefault(data) {
  var buffer = new Buffer(4);
  for(let i = 0; i < 4; i++) {
    buffer[i] = (data >> ((3-i)*8)) & 0xFF;
  }
  return buffer;
}
function _conversionFromDefault(data) {
  let result = 0;
  for(let i = 0; i < 4; i++) {
    result = result | (data[i] << (8*(3-i)));
  }
  return result;
}

function InvalidCharacteristicException(message) {
  this.message = message;
  this.name = "InvalidCharacteristicException";
}


var SimpleCharacteristic = function(settings, obj) {
  if(settings.uuid === undefined) {
    throw new InvalidCharacteristicException("SimpleCharacteristic UUID is undefined");
  }
  let that = this;
  let properties = settings.properties || ['read', 'write', 'writeWithoutResponse', 'notify', 'indicate'];
  this.convertToBuffer = settings.convertToBuffer   || _conversionToDefault;
  this.convertFromBuffer = settings.convertToBuffer || _conversionFromDefault;

  this.obj = obj;

  if(this.obj.subscribe) {
    this.obj.subscribe(function(newValue) {
      if(that._updateValueCallback) {
        that._updateValueCallback(that.convertToBuffer(newValue));
      }
    });
  }

  SimpleCharacteristic.super_.call(this, {
    uuid: settings.uuid,
    properties: properties,
    value: null
  });
};
util.inherits(SimpleCharacteristic, BlenoCharacteristic);

SimpleCharacteristic.prototype.onReadRequest = function(offset, callback) {
  let obj = this.obj;
  if(obj.subscribe) {
    obj = obj();
  }
  if(obj === null) {
    callback(this.RESULT_UNLIKELY_ERROR);
  } else {
    callback(this.RESULT_SUCCESS, this.convertToBuffer(obj));
  }
};

SimpleCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  data = this.convertFromBuffer(data);
  if(this.obj.subscribe) {
    this.obj(data);
  } else {
    this.obj = data;
    if(this._updateValueCallback) {
      this._updateValueCallback(data);
    }
  }
  callback(this.RESULT_SUCCESS);
};

SimpleCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  this._updateValueCallback = updateValueCallback;
  updateValueCallback(this.convertToBuffer(this.obj));

};

SimpleCharacteristic.prototype.onUnsubscribe = function() {
  this._updateValueCallback = null;
};

module.exports = SimpleCharacteristic;
