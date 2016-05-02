/*jshint esnext:true*/
"use strict";
var util = require('util');

var SimpleCharacteristic = require("./simple-characteristic");

var os = require('os');
var ko = require("knockout");
//https://github.com/bakerface/wireless-tools



function addressToBuffer(ip) {
  if(ip && ip.subscribe) {
    ip = ip();
  }
  if(ip && ip.split) {
    let ipParts = ip.split(".");
    let ipNum = new Buffer(4);
    ipParts.forEach(function(part, index) {
      ipNum[index] = parseInt(part);
    });
    return ipNum;
  } else {
    return new Buffer(0);
  }
}





var IfaceCharacteristic = function(settings) {
  settings = settings || {};
  this._value = ko.observable(this.getAddress());
  this._name = settings.name;

  IfaceCharacteristic.super_.call(this, {
    uuid: settings.uuid || 'AD2E55',
    properties: ['read', 'notify'],
    convertToBuffer: addressToBuffer
  }, this._value);

  this._updateValueCallback = null;
  this.checkAddressInBackground();
};


IfaceCharacteristic.prototype.getAddress = function() {
  let interfaces = os.networkInterfaces();
  let ip;
  if(interfaces && interfaces[this._name]) {
    interfaces[this._name].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      ip = iface.address;
      return;
    });
  }
  return ip;
};



util.inherits(IfaceCharacteristic, SimpleCharacteristic);

IfaceCharacteristic.prototype.checkAddressInBackground = function() {
  var that = this;
  function check() {
      let ip = that.getAddress();
      that._value(ip);
  }
  this._interval = setInterval(check, 1000);
};
module.exports = IfaceCharacteristic;
