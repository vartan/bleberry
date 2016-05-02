"use strict";
var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
var IfaceCharacteristic = require('./iface-characteristic');
var CounterCharacteristic = require('./counter-characteristic');



bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('echo', ['ec00']);
  } else {
    bleno.stopAdvertising();
  }
});





bleno.on('advertisingStart', function(error) {
  console.log('Bluetooth Advertising ' + (error ? 'Error :( ' + error : 'Started :)'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'ec00',
        characteristics: [
          new CounterCharacteristic({uuid: "1"}),
          new IfaceCharacteristic({name:"wlan0",uuid:"2"}),
          new IfaceCharacteristic({name:"en0",uuid:"3"})
        ]
      })
    ]);
  }
});
