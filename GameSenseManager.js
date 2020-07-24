const http = require('http');
const fs = require('fs');

module.exports = class GameSenseManager {
    constructor(headset_name) {
        this.app_name = "ARCTIS_BATTERY"
        const corePropsFilename = '%PROGRAMDATA%/SteelSeries/SteelSeries Engine 3/coreProps.json';
        const absoluteCorePropsFilename = corePropsFilename.replace(/%([^%]+)%/g, function replaceEnvVariables(ignore, index) {
            return process.env[index];
        });

        const corePropsJson = fs.readFileSync(absoluteCorePropsFilename, {encoding: 'utf-8'});
        if (corePropsJson) {
            const endpoint = JSON.parse(corePropsJson).address.split(':');

            this.sseAddress = endpoint[0];
            this.ssePort = endpoint[1];
        }
        else
            throw new Error("Error finding SSE address.");


        const app_reg_data = {
            game: this.app_name,
            game_display_name: "Arctis Battery OLED Indicator",
            developer: "Eran Vazana"
        };

        this.postToEngine("/game_metadata", app_reg_data);

        this.percent_event_name = "DISPLAY_HEADSET_PERCENT";

        const percent_event = {
            game: this.app_name,
            event: this.percent_event_name,
            value_optional: true,
            handlers: [{
                "device-type": "screened",
                "mode": "screen",
                "datas": [
                    {
                        "lines": [{
                            "has-text": true,
                            "context-frame-key": "headline",
                            "prefix": headset_name + " - ",
                            "bold": true,
                        },
                            {
                                "has-text": true,
                                "context-frame-key": "subline"
                            },
                            {
                                "has-progress-bar": true,
                                "context-frame-key": "progress"
                            }
                        ]
                    }
                ]
            }]
        };

        this.postToEngine("/bind_game_event", percent_event);
    }

    displayBatteryPercentage(percent){
        const headset_status = function (p) {
            if (p === '-')
                return "Offline";
            return "Online"
        };

        let text_to_display = "Battery Percent: " + percent;
        if (percent !== '-')
            text_to_display += '%';

        const event_data = {
            game: this.app_name,
            event: this.percent_event_name,
            data: {frame: {headline: headset_status(percent), subline: text_to_display, progress: percent}}

        };

        this.postToEngine("/game_event", event_data);
    }

    postToEngine(request_type, data) {
        const jsonData = JSON.stringify(data);

        const options = {
            host: this.sseAddress,
            port: this.ssePort,
            path: request_type,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': jsonData.length
            }
        };

        const request = http.request(options, function handleResponse(response) {
            response.setEncoding('utf8');
            response.on('data', function handleOnData(chunk) {
                if (response.statusCode !== 200)
                    throw new Error(JSON.parse(chunk)["error"]);
            });
        });

        request.write(jsonData);
        request.end();
    }

    removeApp(){
        const event = {
            game: this.app_name,
        };
        this.postToEngine("/remove_game", event);
    }
}