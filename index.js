/*jshint esnext:true*/
"use strict";
var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
var IfaceCharacteristic = require('./iface-characteristic');
var CounterCharacteristic = require('./counter-characteristic');
var LoadAverageCharacteristics = require('./load-avg-characteristic');
var HostnameCharacteristic = require('./hostname-characteristic');




bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('echo', ['ec00']);
  } else {
    bleno.stopAdvertising();
  }
});





bleno.on('advertisingStart', function(error) {
  console.log('Bluetooth Advertising ' + (error ? 'Error :( ' + error : 'Started :)'));
  let loadAvgs = LoadAverageCharacteristics("4", "5", "6");
  if (!error) {

    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'ec00',
        characteristics: [
          new CounterCharacteristic({uuid: "1"}),
          new IfaceCharacteristic({name:"wlan0",uuid:"2"}),
          new IfaceCharacteristic({name:"en0",uuid:"3"}),
          loadAvgs[0],
          loadAvgs[1],
          loadAvgs[2],
          new HostnameCharacteristic({uuid:"7"})
        ]
      })
    ]);
  }
});
