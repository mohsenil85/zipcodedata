'use strict';

const request = require('request');
const sprintf = require('sprintf-js').sprintf;

const openWeatherApiKey = '94ea6a76e3743679b7b79642d332af22';
const openWeatherApiUrl = 'http://api.openweathermap.org/data/2.5/weather';

const googleMapsApiKey = 'AIzaSyCXPMOnpBe_YPH2L1PcFvHVXK6Z7q0xkz4';
const timezoneUrl = 'https://maps.googleapis.com/maps/api/timezone/json';
const elevationUrl = 'https://maps.googleapis.com/maps/api/elevation/json';

function fetchWeatherData(zipCode) {
    const openWeatherOptions = {
        uri: openWeatherApiUrl,
        qs: {
            APPID: openWeatherApiKey,
            units: 'imperial',
            zip: zipCode + ',us'
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        request(openWeatherOptions, (error, response, body) => {
            if (error) return reject(error);
            //return 4 pieces of info:  name, temp, and the lat and long, which we need for the
            //subsequent api hits
            resolve([body.name, body.main.temp, body.coord.lat, body.coord.lon]);
        })
    });
}

function fetchTimezoneData(lat, lon) {
    const timezoneOptions = {
        uri: timezoneUrl,
        qs: {
            location: '' + lat + ',' + lon,
            timestamp: Math.floor(Date.now() / 1000),//this is in seconds, not millis!
            key: googleMapsApiKey,
        },
        json: true,
    };
    return new Promise((resolve, reject) => {
        request(timezoneOptions, (error, response, body) => {
            if (error) return reject(error);
            resolve(body.timeZoneId);
        })
    });
}

function fetchElevationData(lat, lon) {
    const elevationOptions = {
        uri: elevationUrl,
        qs: {
            key: googleMapsApiKey,
            timestamp: Date.now(),
            locations: '' + lat + ',' + lon
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        request(elevationOptions, (error, response, body) => {
            if (error) return reject(error);
            resolve(body.results[0].elevation);
        })
    });
}

function validateArgs() {
    const validZipRegex = /^\d{5}(?:-\d{4})?$/;
    //a valid zipcode looks like '82801' or '82801-2202'
    //(ie, no need to worry about the case of '82801 2202' and consequent argv[3])
    if (!process.argv[2]) {
        console.log('Error:  Please provide a zipcode');
        return false;
    } else if (!validZipRegex.test(process.argv[2])) {
        console.log('Error:  Please provide a valid zipcode');
        return false;
    } else {
        return true;
    }
}

function reportData(name, temp, timezome, elevation) {
    const reportFormat = 'At the location %s, the temperature is %s, the timezone is %s, and the elevation is %s.';
    return sprintf(reportFormat, name, temp, timezome, elevation);
}

async function main() {
    if (validateArgs()) {
        let zipCode = process.argv[2];
        let [name, temp, lat, lon] = await fetchWeatherData(zipCode);
        let timezone = await fetchTimezoneData(lat, lon);
        let elevation = await fetchElevationData(lat, lon);
        const result = reportData(name, temp, timezone, elevation);
        console.log(result);
        process.exit(0);//be good unix citizens and explicitly report our success
    } else {
        //if we had trouble parsing argv, let's bail
        process.exit(1);
    }

}

if (require.main === module) {
    main().catch(reason => console.log(reason));
    // fetchTimezoneData("39.60", "-119.68");

}
