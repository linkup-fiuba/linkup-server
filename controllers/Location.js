'use strict';


function Location(config) {
	this.config = config;
	this.getLocation = getLocation;
	this.createLocation = createLocation;
	this.updateLocation = updateLocation;
}

function createLocationController(config) {
	return new Location(config);
}


function getLocation(userId, callback) {
	var config = this.config;
	config.redisLib.getHashField(config.usersKey+userId, 'location', function(err, response) {
		if (err) callback(err, null);
		if (response) {
			var locObj = JSON.parse(response);
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
	var config = this.config;
	location = JSON.stringify(location);
	config.redisLib.setHashField(config.usersKey+userId, 'location', location, function (err, response) {
		if (err) return callback(err, null);
		return callback(null, true);
	}); 		
		

}


function updateLocation(userId, locationUpdate, callback) {
	var config = this.config;
	locationUpdate = JSON.stringify(locationUpdate);
	config.redisLib.setHashField(config.usersKey+userId, 'location', locationUpdate, function(error, location) {
		if (error) return callback (error, null);
			//actualizar location en this.config.ESLib TODO 
			config.ESLib.addToIndex('users', 'user', userId, {location: JSON.parse(locationUpdate)}, function (err, res) {
				if (err) {
					return callback(null, false);
				} else {
					return callback(null, true);
				}
			});
		

	});
}

module.exports = {
	createLocationController: createLocationController,
	getLocation: getLocation,
	createLocation: createLocation,
	updateLocation: updateLocation
}