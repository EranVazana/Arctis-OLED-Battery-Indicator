import { Service } from 'node-windows';

const svc = new Service({
	name: 'Arctis Headset OLED Battery Indicator',
	description: 'Display battery information on your OLED screen.',
	script: 'main.js',
});

svc.on('install', function () {
	svc.start();
});

svc.install();
