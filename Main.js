// SteelSeries Arctis Headsets Battery Indicator on OLED.
// Made by: Eran Vazna.
// Thanks for cheking out my project!

const ListHeadsets = require('./ListHeadsets.js');
const Headset = require('./Headset.js');
const GameSenseManager = require('./GameSenseManager.js');

const exitHook = require('exit-hook');
const prependFile = require('prepend-file');

function getTimeStamp(){
    var date = new Date();
    var timeStamp =
    ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
    ("00" + date.getDate()).slice(-2) + "/" +
    date.getFullYear() + " " +
    ("00" + date.getHours()).slice(-2) + ":" +
    ("00" + date.getMinutes()).slice(-2) + ":" +
    ("00" + date.getSeconds()).slice(-2);

    return timeStamp;
}

function writeToLogFile(data){
    prependFile.sync('log.txt', getTimeStamp() + " - " + data + '\n##########\n'); 
}

try {
    var headsetCreds = ListHeadsets.getConnectedHeadset();
    var myHeadset = new Headset(headsetCreds);
    var myGameSenseManager = new GameSenseManager(myHeadset.headsetName);

    exitHook(() => {
        myGameSenseManager.onExit();
    });
}
catch (init_error) {
    writeToLogFile(init_error); 
    return;
}

setInterval(function(){
    try {
        let battery_percent = myHeadset.getBatteryPercentage();
        myGameSenseManager.displayBatteryPercentage(battery_percent);
    }
    catch (write_error) {
        writeToLogFile(write_error);
    }
}, 1000);