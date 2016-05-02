/*jshint esnext:true*/
"use strict";
var util = require('util');
var bleno = require("bleno");
var BlenoCharacteristic = bleno.Characteristic;
var os = require('os');
var KeyMirror = require('keymirror');
var Types = KeyMirror({IntegerCharacteristic:null, StringCharacteristic:null, FloatCharacteristic:null, OtherCharacteristic:null});
// By default, treat as integer.

function _conversionToDefault(that) {
  return function(data) {
    console.log(that.type);
    if(that.type === Types.IntegerCharacteristic) {
      let buffer = new Buffer(4);
      for(let i = 0; i < 4; i++) {
        buffer[i] = (data >> ((3-i)*8)) & 0xFF;
      }
      return buffer;
    } else if(that.type === Types.StringCharacteristic) {
      return Buffer.from(data);
    } else if(that.type === Types.FloatCharacteristic) {
        let buffer = new Buffer(4);
        var intView = new Int32Array(buffer);
        var floatView = new Float32Array(buffer);
        floatView[0] = data;
        console.log(data);
        console.log(buffer);
        return buffer;
    } else {
      throw new CharacteristicOtherNoConversionException();
    }
  };
}
function _conversionFromDefault(that) {
  return function(data) {
    let result = 0;
    for(let i = 0; i < 4; i++) {
      result = result | (data[i] << (8*(3-i)));
    }
    return result;
  };
}

function InvalidCharacteristicException(message) {
  this.message = message;
  this.name = "InvalidCharacteristicException";
}

function CharacteristicOtherNoConversionException(message) {
  this.message = message;
  this.name = "CharacteristicOtherNoConversionException";
}
var SimpleCharacteristic = function(settings, obj) {
  if(settings.uuid === undefined) {
    throw new InvalidCharacteristicException("SimpleCharacteristic UUID is undefined");
  }
  let that = this;
  let properties = settings.properties || ['read', 'write', 'writeWithoutResponse', 'notify', 'indicate'];
  if((settings.convertToBuffer !== undefined || settings.convertFromBuffer !== undefined) && !settings.type) {
    this.type = Types.OtherCharacteristic;
  } else {
    this.type = settings.type || Types.IntegerCharacteristic;
  }
  this.convertToBuffer = settings.convertToBuffer   || _conversionToDefault(this);
  this.convertFromBuffer = settings.convertToBuffer || _conversionFromDefault(this);

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
SimpleCharacteristic.Types = Types;
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
