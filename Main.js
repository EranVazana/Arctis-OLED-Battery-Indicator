/**
 * @author EranVazana
 */

const ListHeadsets = require('./ListHeadsets.js');
const Headset = require('./Headset.js');
const GameSenseManager = require('./GameSenseManager.js');

const exitHook = require('exit-hook');

// @todo: cross-platform support
const EventLogger = require('node-windows').EventLogger;
const BatteryCheckTimeMS = 10000;
const log = new EventLogger('Arctis OLED');

let myHeadset;
let myGameSenseManager;
let batteryCheckInterval;

try {
    const headsetCreds = ListHeadsets.getConnectedHeadset();
    myHeadset = new Headset(headsetCreds);
    myGameSenseManager = new GameSenseManager(myHeadset.headsetName);

    exitHook(() => {
        if (batteryCheckInterval) {
            clearInterval(batteryCheckInterval);
        }
        myGameSenseManager.onExit();
    });

    log.info('Initialized successfully ');
} catch (init_error) {
    console.log(init_error);
    log.error(init_error);
    return;
}

// check battery on initial run
checkBattery();

batteryCheckInterval = setInterval(function(){
    checkBattery();
}, BatteryCheckTimeMS);

function checkBattery() {
    try {
        let battery_percent = myHeadset.getBatteryPercentage();
        myGameSenseManager.displayBatteryPercentage(battery_percent);
    } catch (write_error) {
        console.log(write_error);
        log.error(write_error);
    }
}