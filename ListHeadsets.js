const HID = require('node-hid');

const headsets_ids = [
    [0x1038, 0x12ad], // Arctis 7 2019
    [0x1038, 0x1260], // Arctis 7 2017
    [0x1038, 0x1294], // Arctis Pro
    [0x1038, 0x12b3] // Actris 1 Wireless
]

module.exports = {
    getConnectedHeadset: () => {
        const devices = HID.devices();
        const deviceInfo = devices.filter((d) => {
            return headsets_ids.some((id) => {
                return d.vendorId === id[0] && d.productId === id[1] && d.usage !== 1;
            })
        })

        if(deviceInfo.length === 0)
            throw new Error('Error: No Headset connected!');

        return deviceInfo[0];
    }
}