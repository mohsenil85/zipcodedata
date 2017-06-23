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
            //return 4 pieces of info:  name, temp, and the lat and long,
            // which we need for the subsequent api hits
            resolve([body.name, body.main.temp, body.coord.lat, body.coord.lon]);
        })
    });
}

function fetchTimezoneData(lat, lon) {
    const timezoneOptions = {
        uri: timezoneUrl,
        qs: {
            location: '' + lat + ',' + lon,
            timestamp: Math.floor(Date.now() / 1000),//this is inseconds, not millis!
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
    //print the formatted string to stdout
    const reportFormat = 'At the location %s, the temperature is %s, the timezone is %s, and the elevation is %s.';
    const formattedData = sprintf(reportFormat, name, temp, timezome, elevation);
    console.log(formattedData);
}

async function main() {
    if (validateArgs()) {
        const zipCode = process.argv[2];
        //retrieve the name, temp, and lat & long which we need for the google apis
        const [name, temp, lat, lon] = await fetchWeatherData(zipCode);
        //now that we have lat and long, we can hit the next api's
        const timezone = await fetchTimezoneData(lat, lon);
        const elevation = await fetchElevationData(lat, lon);
        //now we have the four required info, so we will put them into the report function
        reportData(name, temp, timezone, elevation);
    }
}

if (require.main === module) {
    main()
        .catch(reason => console.log(reason));
}
