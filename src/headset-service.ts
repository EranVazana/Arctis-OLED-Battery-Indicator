import HID from 'node-hid';
import { HeadsetModels } from './consts';

export class HeadsetService {
	private headsetName: string;
	private device: HID.HID;

	constructor(private deviceInfo = HeadsetService.getConnectedHeadset()) {
		this.headsetName = this.deviceInfo.product.replace('SteelSeries ', '');
		this.device = new HID.HID(this.deviceInfo.path);

		if (!this.device) {
			throw new Error('Error initialize Headset.');
		}
	}

	public getHeadsetName(): string {
		return this.headsetName;
	}

	public getBatteryPercentage(): number {
		try {
			this.device.write([0x06, 0x18]);
			const report = this.device.readSync()[2];
			return report > 1 ? report : -1;
		} catch (error) {
			throw new Error('Error: Cannot write to Headset.');
		}
	}

	static getConnectedHeadset() {
		const devices = HID.devices();

		const connectedDevice = devices.find((device) => {
			return Object.values(HeadsetModels).find((model) => {
				device.vendorId === model.vendorId && device.productId === model.productId && device.usage !== 1;
			});
		});

		if (!connectedDevice) {
			throw new Error('Error: No Headset connected!');
		}

		return connectedDevice;
	}
}
