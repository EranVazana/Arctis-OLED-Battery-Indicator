const HID = require('node-hid');
HID.setDriverType('libusb');

module.exports = class Headset {
    constructor(deviceInfo) {
        this.headset_name = deviceInfo["product"].replace("SteelSeries ","");
        this.device = new HID.HID(deviceInfo.path);
        this.device.setNonBlocking(HID.HID.no_block);
        if (!this.device)
            throw new Error('Error initialize Headset.');
    }

    get headsetName(){
        return this.headset_name;
    }

    getBatteryPercentage() {
        try{
            this.device.write([0x06, 0x18])
            const report = this.device.readTimeout(1000)[2];
            if (parseInt(report) > 1)
                return report;
            return null;

        } catch (error) {
            throw new Error('Cannot write to Headset.');
        }
    }
}
