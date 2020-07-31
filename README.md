# Arctis OLED Battery Indicator

This connects to the [SteelSeries Engine](https://steelseries.com/engine) to display battery percentage info for the following headsets:

- Arctis 7 2019
- Arctis 7 2017
- Arctis Pro
- Arctis 1 Wireless

## Installation

Currently this only runs on Windows 10 and requires [Node JS](https://nodejs.org/en/) version 12+.

After installing Node JS, open a command prompt and navigate to the directory you placed the files in.

Install NodeJS dependencies for the project by doing
```bash
npm install
```

## Running
You can run this program manually by doing
```bash
node Main.js
```

Or by double-clicking the [Run.bat](./Run.bat) file.

## Installing as a service
This can also be installed as a service by doing either
```bash
node InstallAsService.js
```

Or by double-clicking the [Install As Service](<./Install As Service.bat>) file.