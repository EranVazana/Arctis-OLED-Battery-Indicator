const ListHeadsets = require('./ListHeadsets.js')
const Headset = require('./Headset.js')
const GameSenseManager = require('./GameSenseManager.js')

try {
    var headsetCreds = ListHeadsets.getConnectedHeadset()
    var myHeadset = new Headset(headsetCreds)
    var myGameSenseManager = new GameSenseManager(myHeadset.headsetName)
}
catch (init_error) {
    console.log(init_error)
    return;
}

setInterval(function(){
    try {
        var battery_percent = myHeadset.getBatteryPercentage()
        myGameSenseManager.displayBatteryPercentage(battery_percent)
    }
    catch (write_error) {
        console.log(write_error)
    }
}, 1000);