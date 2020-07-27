import exitHook from 'exit-hook';
import { EventLogger } from 'node-windows';
import { HeadsetService } from './headset-service';
import { GameSenseManager } from './game-sense-manager';

const main = async () => {
	try {
		const headsetService = new HeadsetService();
		const gameSenseManager = new GameSenseManager(headsetService.getHeadsetName());

		gameSenseManager.init().start();

		let interval = setInterval(() => {
			try {
				let batteryPercentage = headsetService.getBatteryPercentage();
				gameSenseManager.displayBatteryPercentage(batteryPercentage);
			} catch (err) {
				console.error(err);
			}
		}, 1000);

		exitHook(() => {
			gameSenseManager.onExit();
			clearInterval(interval);
		});
	} catch (err) {
		console.error(err);
	}
};

main();
