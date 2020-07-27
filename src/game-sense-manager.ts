import fs from 'fs';
import fetch from 'node-fetch';
import { PERCENTAGE_EVENT } from './consts';

export class GameSenseManager {
	private sse: { address: string; port: number };

	constructor(private headsetName: string, private appName = 'ARCTIS_BATTERY') {}

	init() {
		const corePropsJson = fs.readFileSync(`${process.env.programData}/SteelSeries/SteelSeries Engine 3/coreProps.json`, { encoding: 'utf-8' });

		if (corePropsJson) {
			const [address, port] = JSON.parse(corePropsJson).address.split(':');

			this.sse.address = address;
			this.sse.port = Number(port);

			return this;
		} else {
			throw new Error('Error finding SSE address.');
		}
	}

	start() {
		const app_reg_data = {
			game: this.appName,
			game_display_name: 'Arctis Battery OLED Indicator',
			developer: 'Eran Vazana',
		};

		this.postToEngine('/game_metadata', app_reg_data);

		const percent_event = {
			game: this.appName,
			event: PERCENTAGE_EVENT,
			value_optional: true,
			handlers: [
				{
					'device-type': 'screened',
					mode: 'screen',
					datas: [
						{
							lines: [
								{
									'has-text': true,
									'context-frame-key': 'headline',
									prefix: this.headsetName + ' - ',
									bold: true,
								},
								{
									'has-text': true,
									'context-frame-key': 'subline',
								},
								{
									'has-progress-bar': true,
									'context-frame-key': 'progress',
								},
							],
						},
					],
				},
			],
		};

		this.postToEngine('/bind_game_event', percent_event);
	}

	displayBatteryPercentage(percent) {
		const headset_status = (percent: number) => (percent === -1 ? 'Offline' : 'Online');

		let text_to_display = `Battery Percent: ${percent}`;

		if (percent !== -1 && percent === 100) {
			text_to_display += '%';
		}

		const event_data = {
			game: this.appName,
			event: PERCENTAGE_EVENT,
			data: {
				frame: {
					headline: headset_status(percent),
					subline: text_to_display,
					progress: percent,
				},
			},
		};

		this.postToEngine('/game_event', event_data);
	}

	onExit() {
		const exit_event = {
			game: this.appName,
		};

		this.postToEngine('/stop_game', exit_event);
	}

	removeApp() {
		const remove_event = {
			game: this.appName,
		};

		this.postToEngine('/remove_game', remove_event);
	}

	private async postToEngine(path: string, data: object) {
		const options = {
			...this.sse,
			path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		};

		return await fetch(path, options);
	}
}
