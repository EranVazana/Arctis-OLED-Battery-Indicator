const ListHeadsets = require('./ListHeadsets.js')
const Headset = require('./Headset.js')
const GameSenseManager = require('./GameSenseManager.js')

const exitHook = require('exit-hook');

const EventLogger = require('node-windows').EventLogger;

const log = new EventLogger({
    source: 'Arctis Headset OLED Battery Indicator',
    eventLog: 'SYSTEM'
});

try {
    let headsetCreds = ListHeadsets.getConnectedHeadset()
    let myHeadset = new Headset(headsetCreds)
    let myGameSenseManager = new GameSenseManager(myHeadset.headsetName)

    exitHook(() => {
        myGameSenseManager.onExit();
    });
}
catch (init_error) {
    log.error(init_error);
    return;
}

setInterval(function(){
    try {
        let battery_percent = myHeadset.getBatteryPercentage()
        myGameSenseManager.displayBatteryPercentage(battery_percent)
    }
    catch (write_error) {
        log.error(write_error);
    }
}, 1000);