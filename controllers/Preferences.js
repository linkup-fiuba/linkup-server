'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');
var config 		= require('../config');
var Around	 	= require('./Around');

function getPreferences(userId, callback) {
	redisLib.getHash(config.preferencesKey+userId, function(err,response) {
		if (err) callback(err, null);
		if (response) {
			var preferences = {
				userId: response.userId,
		        gender: response.gender,
		        distance: response.distance,
		        minAge: response.minAge,
		        maxAge: response.maxAge,
		        mode: response.mode,
		        searchMode: response.searchMode
			};
			return callback(null, preferences);
		} else {
			return callback(null, null);
		}
	})
}

function createPreferences(userId, preferences, callback) {
	redisLib.setHash(config.preferencesKey+userId, preferences, function (err, response) {
		if (err) return callback(err, null);
		Around.createAroundUser(userId, function (err, response) {
			return callback(null, response);
		})
	}); 		
		

}


function updatePreferences(userId, preferencesUpdate, callback) {
	redisLib.getHash(config.preferencesKey+userId, function(error, preferences) {
		if (error) return callback (error, null);
		if (preferences) {
			updateFieldPreferences(preferences, preferencesUpdate, function (err, response) {
				if (err) callback(err, null);
				return callback(null, response);
			})
		} else {
			return callback(null, null);
		}

	});
}

function updateFieldPreferences(preferences, preferencesUpdate, cbUpdate) {
	async.forEach(Object.keys(preferencesUpdate), function (preferencesField, callback){ 
	    if (preferencesUpdate[preferencesField] instanceof Array) {
	    	preferencesUpdate[preferencesField] = JSON.stringify(preferencesUpdate[preferencesField]);
	    }
	    redisLib.setHashField(config.preferencesKey+preferences.userId,preferencesField,preferencesUpdate[preferencesField], function (err, response) {
			if (err) return cbUpdate(err, null);
			callback();
		});

	}, function(err) {
		if (err) return cbUpdate(err, null);
	    cbUpdate(null, "OK");
	});  
}

function parsePreferences(userId, preferences, callbackPreferences) {
	async.waterfall([
	    function parseGender(callback) {
	    	if (preferences.gender != "female" && preferences.gender != "male" && preferences.gender != "both") {
	    		callbackPreferences("Gender not supported", null);
	    	} else {
	    		callback(null, preferences);
	    	}
	    },
	    function parseMode(preferences, callback) {
	    	if (preferences.mode != "visible" && preferences.mode != "invisible") {
	    		callbackPreferences("Mode invalid", null);
	    	} else {
	    		callback(null, preferences);
	    	}
	    },
	    function parseSearchMode(preferences, callback) {
	    	if (preferences.searchMode != "couple" && preferences.searchMode != "friendship") {
	    		callbackPreferences("Search Mode invalid", null);
	    	} else {
	    		callback(null, preferences);
	    	}
	    }
	], function (error, preferences) {
	    if (error) {
	    	callbackPreferences(error, null);
	    }
	    var preferences = {
			userId: userId,
			gender: preferences.gender,
			distance: preferences.distance,
			minAge: preferences.minAge,
			maxAge: preferences.maxAge,
			mode: preferences.mode,
			searchMode: preferences.searchMode
		}
		
	    callbackPreferences(null, preferences);
	});

}


function removePreferences(userId) {
	
}

module.exports = {
	getPreferences: getPreferences,
	createPreferences: createPreferences,
	updatePreferences: updatePreferences,
	parsePreferences: parsePreferences
}