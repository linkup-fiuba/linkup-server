'use strict';


function Configuration(config) {
	this.config = config;
	this.getConfig = getConfig;
	this.setConfig = setConfig;
	this.updateConfig = updateConfig;
}

function createConfigurationController(config) {
	return new Configuration(config);
}


function getConfig(callback) {
	var config = this.config;
	config.redisLib.getHash('config', function(err, response) {
		if (err) callback(err, null);
		if (response) {
			var configuration = {
				limit: response.limit,
		        distanceUnit: response.distanceUnit,
		        maxDistanceSearch: response.maxDistanceSearch,
		        maxAge: response.maxAge
			};
			return callback(null, configuration);
		} else {
			var configuration = {
				limit: config.limitDefault,
		        distanceUnit: config.distanceUnitDefault,
		        maxDistanceSearch: config.maxDistanceSearchDefault,
		        maxAge: config.maxAgeDefault
			};
			return callback(null, configuration);
		}
	})
}

function setConfig(configObject, callback) {
	var config = this.config;
	config.redisLib.setHash('config', configObject, function (err, response) {
		if (err) return callback(err, null);
		return callback(null, true);
	}); 		
		

}


function updateConfig(configUpdate, callback) {
	var config = this.config;
	var fields = Object.keys(configUpdate);
	config.async.each(fields, function (field, callbackIt) {
		config.redisLib.setHashField('config', field, configUpdate[field], function(error, response) {
			if (error) return callbackIt (error, null);
			return callbackIt(null, true);
		});
	}, function finish(err) {
		return callback(null, true);
	});
	
}

module.exports = {
	createConfigurationController: createConfigurationController,
	getConfig: getConfig,
	setConfig: setConfig,
	updateConfig: updateConfig
}