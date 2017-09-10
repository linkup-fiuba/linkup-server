'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');

var preferencesKey = 'preferences_';

function getPreferences(userId, callback) {
	redisLib.getHash(preferencesKey+userId, function(err,response) {
		if (err) callback(err, null);
		return callback(null, response);
	})
}

function createPreferences(userId, preferences, callback) {
	redisLib.exists(preferencesKey+userId, function(err, exists) {
		if (exists) {
			return callback(null, null);
		} else {
			redisLib.setHash(preferencesKey+userId, preferences, function (err, response) {
				if (err) return callback(err, null);
				return callback(null, response);
			}); 		
		}
	})
}


function updatePreferences(userId, preferencesUpdate, callback) {
	redisLib.getHash(preferencesKey+userId, function(error, preferences) {
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
	    redisLib.setHashField(preferencesKey+preferences.userId,preferencesField,preferencesUpdate[preferencesField], function (err, response) {
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

module.exports = {
	getPreferences: getPreferences,
	createPreferences: createPreferences,
	updatePreferences: updatePreferences,
	parsePreferences: parsePreferences
}