const HID = require('node-hid');

module.exports = class Headset {
    constructor(deviceInfo) {
        this.headset_name = deviceInfo['product'].replace('SteelSeries ', '');
        this.device = new HID.HID(deviceInfo.path);
        if (!this.device)
            throw new Error('Error initialize Headset.');
    }

    get headsetName() {
        return this.headset_name;
    }

    getBatteryPercentage() {
        try {
            this.device.write([0x06, 0x18]);
            const report = this.device.readSync()[2];
            console.log(report);
            if (parseInt(report) > 1)
                return report;
            else {
                return '-';
            }

        } catch (error) {
            throw new Error('Error: Cannot write to Headset.');
        }
    }
};