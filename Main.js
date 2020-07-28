const ListHeadsets = require('./ListHeadsets.js');
const Headset = require('./Headset.js');
const GameSenseManager = require('./GameSenseManager.js');

const exitHook = require('exit-hook');

const EventLogger = require('node-windows').EventLogger;
var log = new EventLogger('Arctis OLED');

try {
    var headsetCreds = ListHeadsets.getConnectedHeadset();
    var myHeadset = new Headset(headsetCreds);
    var myGameSenseManager = new GameSenseManager(myHeadset.headsetName);

    exitHook(() => {
        myGameSenseManager.onExit();
    });

    log.info("Initialized successfully ");
}
catch (init_error) {
    console.log(init_error);
    log.error(init_error);
    return;
}

setInterval(function(){
    try {
        let battery_percent = myHeadset.getBatteryPercentage();
        myGameSenseManager.displayBatteryPercentage(battery_percent);
    }
    catch (write_error) {
        console.log(write_error);
        log.error(write_error);
    }
}, 1000);