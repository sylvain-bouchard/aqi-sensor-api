# AQI Sensor API

This project provides a simple MQTT publisher for the Nova SDS011 high precision air quality sensor.
It will send a MQTT message for each new reading of the sensor (at approximately every second, which
is the rate of the sensor). Each sensor reading contains a PM 2.5 and a PM 10 value.

In addition, a simple API over the sensor is supplied. The goal is to provide at a minimum a 
GET route that would allow the querying of a sensor value at a particular point in time. 
For the moment, the only route available returns the sensor value at the time the endpoint is 
requested.

It has been tested to work on Ubuntu Linux and Raspberry Pi.

## Getting Started

The easier way to get started is to build the docker image with the tag 'aqi-sensor-api':

```console
docker build . -t aqi-sensor-api
```

Then launch it using the docker-compose.yaml file provided:

```console
docker-compose up -d
```

The API will listen by default on port 3500. Please refer to the docker-compose.yaml file
in order to change this. Swagger documentation will be available at the route:

http://[host]:3500/api

## Contributing

This project welcomes contributions from the community. For more
detailed information, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Licenses

- This project is licensed under the MIT license.
- The font is licensed under the Open Font License (OFL).

## Feedback

If you find a bug or want to request a new feature, please contact the author.