// SteelSeries Arctis Headsets Battery Indicator on OLED.
// Made by: Eran Vazna.
// Thanks for cheking out my project!

const ListHeadsets = require('./ListHeadsets.js');
const Headset = require('./Headset.js');
const GameSenseManager = require('./GameSenseManager.js');

const exitHook = require('exit-hook');

try {
    var headsetCreds = ListHeadsets.getConnectedHeadset();
    var myHeadset = new Headset(headsetCreds);
    var myGameSenseManager = new GameSenseManager(myHeadset.headsetName);

    exitHook(() => {
        myGameSenseManager.onExit();
    });
}
catch (init_error) {
    console.log(init_error);
    return;
}

setInterval(function(){
    try {
        let battery_percent = myHeadset.getBatteryPercentage();
        myGameSenseManager.displayBatteryPercentage(battery_percent);
    }
    catch (write_error) {
        console.log(write_error);
    }
}, 1000);