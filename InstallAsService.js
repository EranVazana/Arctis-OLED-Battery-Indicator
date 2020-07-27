var Service = require('node-windows').Service;

const svc = new Service({
    name: 'Arctis Headset OLED Battery Indicator',
    description: 'Display battery information on your OLED screen.',
    script: 'Main.js',
});

svc.on('install',function(){
    svc.start();
});

svc.install();