/*jshint esnext:true*/
"use strict";
var util = require('util');

var SimpleCharacteristic = require("./simple-characteristic");

var os = require('os');
var ko = require("knockout");
//https://github.com/bakerface/wireless-tools

var CounterCharacteristic = function(args) {
  args = args || {};
  this._value = ko.observable(0);

  CounterCharacteristic.super_.call(this, {
    uuid: args.uuid || 'AD2E56',
    properties: ['read', 'notify', 'write'],
  }, this._value);

  this._updateValueCallback = null;
  this.countInBackground();
};




util.inherits(CounterCharacteristic, SimpleCharacteristic);

CounterCharacteristic.prototype.countInBackground = function(interval) {
  interval = interval || 200;
  var that = this;
  function count() {
      that._value(that._value()+1);
  }
  this._interval = setInterval(count, interval);
};
module.exports = CounterCharacteristic;
