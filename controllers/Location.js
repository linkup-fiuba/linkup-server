'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');
var config 		= require('../config');

function getLocation(userId, callback) {
	redisLib.getHashField(config.usersKey+userId, 'location', function(err,response) {
		if (err) callback(err, null);
		if (response) {
			var locObj = JSON.parse(response);
			console.log(locObj);
			var location = {
				lat: locObj.lat,
		        lon: locObj.lon
			};
			return callback(null, location);
		} else {
			return callback(null, null);
		}
	})
}

function createLocation(userId, location, callback) {
	location = JSON.stringify(location);
	redisLib.setHashField(config.usersKey+userId, 'location', location, function (err, response) {
		if (err) return callback(err, null);
		return callback(null, response);
	}); 		
		

}


function updateLocation(userId, locationUpdate, callback) {
	locationUpdate = JSON.stringify(locationUpdate);
	redisLib.setHashField(config.usersKey+userId, 'location', locationUpdate, function(error, location) {
		if (error) return callback (error, null);
		if (location) {	
			console.log(location)
			return callback(null, location);
		} else {
			return callback(null, null);
		}

	});
}

module.exports = {
	getLocation: getLocation,
	createLocation: createLocation,
	updateLocation: updateLocation
}