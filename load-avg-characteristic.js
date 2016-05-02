/*jshint esnext:true*/
"use strict";
var util = require('util');

var SimpleCharacteristic = require("./simple-characteristic");

var os = require('os');
var ko = require("knockout");



function getLoadAverageCharacteristics(uuid1, uuid2, uuid3) {
    let uuids = [uuid1, uuid2, uuid3];
    var averages = [];
    let lac = [];
    var LoadAverageCharacteristics = [];
    for(let i = 0; i < 3; i++) {
        averages.push(ko.observable(0));
        LoadAverageCharacteristics.push(new SimpleCharacteristic({
            type: SimpleCharacteristic.Types.FloatCharacteristic,
            properties: ['read', 'notify'],
            uuid:uuids[i]
        }, averages[i]));
    }
    function tick() {
        let loadAverages = os.loadavg();
        for(let i = 0; i < loadAverages.length; i++) {
            averages[i](loadAverages[i]);
        }
    }
    tick();
    setInterval(tick, 10000);
    return LoadAverageCharacteristics;
}
module.exports = getLoadAverageCharacteristics;
