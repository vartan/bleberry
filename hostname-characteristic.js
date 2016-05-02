/*jshint esnext:true*/
"use strict";
var util = require('util');

var SimpleCharacteristic = require("./simple-characteristic");

var os = require('os');
var ko = require("knockout");
//https://github.com/bakerface/wireless-tools

var CounterCharacteristic = function(args) {
  args = args || {};
  this._value = ko.observable(os.hostname());

  CounterCharacteristic.super_.call(this, {
    uuid: args.uuid || 'AD2E56',
    properties: ['read', 'notify', 'write'],
    type: SimpleCharacteristic.Types.StringCharacteristic
  }, this._value);

  this._updateValueCallback = null;
};




util.inherits(CounterCharacteristic, SimpleCharacteristic);

module.exports = CounterCharacteristic;
