/* 
 * @author jeremiahjp (https://github.com/jeremiahp/Weather Bot)
 * @description Discord Bot to display Weather information in the channel
 * @version 0.1.0
*/

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const darkSky = require('dark-sky');
const darksky = new darkSky(config.darkSky);
const geoApiKey = config.google_geo_api;
const YTkey = config.youtube_key_1;
const axios = require('axios');

function getRespectiveTimezoneTime(timezone) {
    let date = new Date().toLocaleString("en-US", {timeZone: timezone});
    return date; 
}

function FtoC(temp) {
    return Math.round((5/9) * (temp - 32));
}

function convertUnixTimetoDate(UNIX_timestamp) {
    let dateStamp = new Date(UNIX_timestamp * 1000);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = dateStamp.getFullYear();
    let month = months[dateStamp.getMonth()];
    let date = dateStamp.getDate();
    let hh = dateStamp.getHours();
    let min = dateStamp.getMinutes() < 10 ? '0' + dateStamp.getMinutes() : dateStamp.getMinutes();
    let sec = dateStamp.getSeconds() < 10 ? '0' + dateStamp.getSeconds() : dateStamp.getSeconds();
    let suffix = "AM";
    let h = hh;
    
    if (h >= 12) {
        h = hh - 12;
        suffix = "PM";
    }
    if (h == 0) {
        h = 12;
    }

    return `${month} ${date} ${year} @ ${h}:${min}:${sec} ${suffix}`;
}

function getDarkSkyWeather(msg, lat, lng, address, forecast) {
    let icon = '';
    const embed = new Discord.RichEmbed();

    darksky
        .latitude(lat)                // required: latitude, string || float.
        .longitude(lng)               // required: longitude, string || float.
        //.time('2016-01-28')         // optional: date, string 'YYYY-MM-DD'.
        .units('us')                  // optional: units, string, refer to API documentation.
        .language('en')               // optional: language, string, refer to API documentation.
        //.exclude('minutely, daily') // optional: exclude, string || array, refer to API documentation.
        .extendHourly(false)          // optional: extend, boolean, refer to API documentation.
        .get()                        // execute your get request.
        .then(function (data) {
             switch (data.currently.icon) {
                 case "clear-day":
                     icon = 'https://i.imgur.com/lm5wgQW.png';
                     break;
                 case "clear-night":
                     icon = 'https://i.imgur.com/Jojls6D.png';
                     break;
                 case "rain":
                     icon = 'https://i.imgur.com/aTyeu84.png';
                     break;
                 case "snow":
                     icon = 'https://i.imgur.com/lKBVyaY.png';
                     break;
                 case "sleet":
                     icon = 'https://i.imgur.com/k7tZQde.png';
                     break;
                 case "wind":
                     icon = 'https://i.imgur.com/Ae8MSRW.png';
                     break;
                 case "fog":
                     icon = 'https://i.imgur.com/k0A7oTT.png';
                     break;
                 case "cloudy":
                     icon = 'https://i.imgur.com/ytPCj12.png';
                     break;
                 case "partly-cloudy-day":
                     icon = 'https://i.imgur.com/Wef17Su.png';
                     break;
                 case "partly-cloudy-night":
                     icon = 'https://i.imgur.com/rvtBjiS.png';
                     break;
                 default:
                     icon = 'https://blog.darksky.net/assets/images/darkskylogo.png';
             }

            // Variables for potential future enhancement.
            // Might use a map for this, dunno.
            let time = '';
            let summary = '';
            let precipIntensity = '';
            let precipProbability = '';
            let precipIntensityMax = '';
            let precipIntensityMaxTime = '';
            let precipType = '';
            let temp = '';
            let feelsTemp = '';
            let dewPoint = '';
            let humidity = '';
            let pressure = '';
            let windSpeed = '';
            let windGust = '';
            let windBearing = '';
            let cloudCover = '';
            let uvIndex = '';
            let visibility = '';
            let ozone = '';
            let sunriseTime = '';
            let sunsetTime = '';
            let moonPhase = '';
            let temperatureHigh = '';
            let temperatureHighTime = '';
            let temperatureLow = '';
            let temperatureLowTime = '';
            let apparentTemperatureHigh = '';
            let apparentTemperatureHighTime = '';
            let apparentTemperatureLow = '';
            let apparentTemperatureLowTime = '';
            let temperatureMin = '';
            let temperatureMinTime = '';
            let temperatureMax = '';
            let temperatureMaxTime = '';
            let apparentTemperatureMin = '';
            let apparentTemperatureMinTime = '';
            let apparentTemperatureMax = '';
            let apparentTemperatureMaxTime = '';
            let alerts = [{}];
            let weatherForecastType = '';
            const timezone = data.timezone;
            /*
                Data example: data.currently
                              data.hourly, data.hourly.data
                              data.daily, data.daily.data,
                              data.flags
            */
            if (!data.minutely) {
                forecast = '-h';
                if (!data.hourly) {
                    forecast = '-d';
                    if (!data.daily) {
                        console.log('Pretty much no data found');
                        throw "error";
                    }
                }
            }

             embed.setTitle(`${address}`)
            .setColor(Math.floor(Math.random() * 16777214 - 0 + 1) + 0)
            .setAuthor("iSuck Bot")
            .setDescription(`**Current local time**:\n${timezone}\n${getRespectiveTimezoneTime(timezone)}`)
            .setThumbnail(icon)
            .setFooter('Dark Sky API', 'https://blog.darksky.net/assets/images/darkskylogo.png');

            // Not very pretty, possible refactor
            switch (forecast) {
                case '-m':
                    time = convertUnixTimetoDate(data.minutely.data[0].time);
                    weatherForecastType = 'Minutely';
                    summary = data.minutely.summary;
                    temp = data.currently.temperature;
                    feelsTemp = data.currently.apparentTemperature;
                    humidity = data.currently.humidity;
                    uvIndex = data.currently.uvIndex;

                    embed.addField(`Summary for ${time}`, summary)

                    .addField("Current temperature", Math.round(temp) + "°F, " + FtoC(Math.round(temp)) + "°C",true)
                    .addField("Current feel", Math.round(feelsTemp) + "°F, " + FtoC(Math.round(feelsTemp)) + "°C",true)
                    .addField("Humidity", Math.round(data.currently.humidity * 100) + "%", true)
                    .addField("UV Index", data.currently.uvIndex, true);

                    break;
                case '-h':
                    const hourly = data.hourly.data[0];
                    time = convertUnixTimetoDate(hourly.time);
                    weatherForecastType = 'Hourly';
                    summary = data.hourly.data[0].summary;
                    temp = data.hourly.data[0].temperature;
                    feelsTemp = data.hourly.data[0].apparentTemperature;
                    humidity = data.hourly.data[0].humidity;
                    uvIndex = data.hourly.data[0].uvIndex;
                    windGust = hourly.windGust;
                    windSpeed = hourly.windSpeed;

                    embed.addField(`Hourly summary for ${time}`, summary, true)
                    .addField("Current temperature", Math.round(temp) + "°F, " + FtoC(Math.round(temp)) + "°C",true)
                    .addField("Current feel", Math.round(feelsTemp) + "°F, " + FtoC(Math.round(feelsTemp)) + "°C",true)
                    .addField("Humidity", Math.round(data.currently.humidity * 100) + "%", true)
                    .addField("UV index", data.currently.uvIndex, true)
                    .addField("Wind Speed", String(windSpeed).substring(0,1) + " mph" + ", " + String(windSpeed*1.609344).substring(0,1) + " kph", true)
                    .addField("Wind Gusts", String(windGust).substring(0,1) + " mph" + ", " + String(windGust*1.609344).substring(0,1) + " kph", true);
                    break;
                case '-d':
                    const daily = data.daily.data[0];
                    time = convertUnixTimetoDate(daily.time);
                    weatherForecastType = 'Daily';
                    summary =  data.daily.summary;
                    temp = daily.temperature;
                    feelsTemp = daily.apparentTemperature;
                    humidity = daily.humidity;
                    temperatureHigh = daily.temperatureHigh;
                    temperatureHighTime = daily.temperatureHighTime;
                    temperatureLow = daily.temperatureLow;
                    temperatureLowTime = daily.temperatureLowTime;

                    embed.addField(`Weekly summary for ${time}`, summary)
                    .addField(`Daily High at ${convertUnixTimetoDate(temperatureHighTime, timezone)}`, Math.round(temperatureHigh) + "°F, " + FtoC(Math.round(temperatureHigh)) + "°C" , true)
                    .addField(`Daily Low at ${convertUnixTimetoDate(temperatureLowTime, timezone)}`, Math.round(temperatureLow) + "°F, " + FtoC(Math.round(temperatureLow)) + "°C")
                    .addField("Humidity", Math.round(data.currently.humidity * 100) + "%", true)
                    .addField("UV Index", data.currently.uvIndex, true);
                    break;
                default:
                    time = convertUnixTimetoDate(data.minutely.data[0].time);
                    weatherForecastType = 'Minutely';
                    summary = data.minutely.summary;
                    temp = data.currently.temperature;
                    feelsTemp = data.currently.apparentTemperature;
                    humidity = data.currently.humidity;
                    uvIndex = data.currently.uvIndex;

                    embed.addField(`Summary for ${time}`, summary)

                    .addField("Current temperature", Math.round(temp) + "°F, " + FtoC(Math.round(temp)) + "°C",true)
                    .addField("Current feel", Math.round(feelsTemp) + "°F, " + FtoC(Math.round(feelsTemp)) + "°C",true)
                    .addField("Humidity", Math.round(data.currently.humidity * 100) + "%", true)
                    .addField("UV Index", data.currently.uvIndex, true);
                    break;
            }
            msg.channel.send({embed});
        })
    .catch(function (data) {
        const embed = new Discord.RichEmbed()
         .setTitle(`DarkSky had an error responding to the request.`)
        .setColor(Math.floor(Math.random() * 16777214 - 0 + 1) + 0)
        .setAuthor("iSuck Bot")
        .setDescription(`Try again. If the problem persists, 
            ask the RNG God to help.`)
        .setFooter("iSuck Bot");
        msg.channel.send({embed});
    });

}

function getGeoCoords(msg, address, forecast) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address='${address}'&key=${geoApiKey}`;
    let timezone = "";
    let lat = '';
    let lng = '';
    let useAxios = true;
    if (useAxios) {
        axios.get(url)
        .then (response => {
            if (!response.data.results[0]) {
                const embed = new Discord.RichEmbed()
                 .setTitle(`Unable to find location.`)
                .setColor(Math.floor(Math.random() * 16777214 - 0 + 1) + 0)
                .setAuthor("iSuck Bot")
                .setDescription(`Try typing in an address, name of a street, landmark, organization, zip code.`)
                .setFooter("iSuck Bot")
                msg.channel.send({embed});
                  return;
            }

              let lat = String(response.data.results[0].geometry.location.lat);
              let lng = String(response.data.results[0].geometry.location.lng).substring(0,7);
              let address = response.data.results[0].formatted_address;

            getDarkSkyWeather(msg, lat, lng, address, forecast);
        })
        .catch(error => {
                const embed = new Discord.RichEmbed()
             .setTitle(`Something went wrong with the request`)
            .setColor(Math.floor(Math.random() * 16777214 - 0 + 1) + 0)
            .setAuthor("iSuck Bot")
            .setDescription(`Try your request again. If the problem continues, tough shit.`)
            .setFooter("iSuck Bot")
            msg.channel.send({embed});
              return;
        });
    }
}



client.on('error', console.error);

client.on('message', async msg => {
    if (msg.content.substring(0,8) === '!weather' ) {

        let split = msg.content.split(" ");
        const forecastTypes = ['-d', '-h', '-m'];

        if (split[0] !== '!weather') {
            return;
        }
        let forecast = false;
        let zip = '';
        let defaultForecast = '';
        let included = '';

        if (!forecastTypes.includes(split[1])) {
            defaultForecast = '-h';
            included = false;
        }
        else {
            defaultForecast = split[1];
            included = true;
        }

        if (split.length === 1) {

            const embed = new Discord.RichEmbed()
             .setTitle(`Invalid Usage`)
            .setColor(Math.floor(Math.random() * 16777214 - 0 + 1) + 0)
            .setAuthor("iSuck Bot")
            .setDescription(`Usage: !weather [-m | -d | -h] location

                               *If minutely, hourly, or daily is omitted or wrong, default hourly.*
                                   Also might be broken atm

                               Examples: 
                               1) !weather san diego
                               2) !weather minutely 12345
                               3) !weather daily dallas
                               4) !weather hourly trump tower`)
            .setFooter("iSuck Bot")
            msg.channel.send({embed});
            return;            
        }
        split.shift();
        if (!included) {
            zip = split.join(' ');
            //zip = msg.content.substring(8+split[1].length+1).trim();
        }
        else {
            split.shift();
            zip = split.join(' ');
            //zip = msg.content.substring(8+split[2].length+1).trim();
        }
        getGeoCoords(msg, zip, defaultForecast);
    }
});

client.login(config.token);