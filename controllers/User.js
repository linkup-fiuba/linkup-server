'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');
var config	 	= require('../config');
var Preferences = require('./Preferences')

function getUser(userId, callback) {
	redisLib.getHash(config.usersKey+userId, function(err,response) {
		if (err) callback(err, null);
		return callback(null, response);
	})
}

// limit para paginacion
function getUsers(callback) {
	redisLib.getHash(config.usersKey, function(err, response) {
		if (err) callback(err, null);
		return callback(null, response);
	})
}


function createUser(userId, user, callback) {
	redisLib.exists(config.usersKey+userId, function(err, exists) {
		if (exists) {
			return callback(null, null);
		} else {
			redisLib.addToSet(config.genderKey+user.gender, userId, function (err, reply) {
				if (err) callback (err, null);
				redisLib.addToSet(config.genderKey+config.bothKey, userId, function (err, reply) {
					if (err) callback(err, null);

				});
				redisLib.setHash(config.usersKey+userId, user, function (err, response) {
					if (err) return callback(err, null);
					return callback(null, response);
				});
			});

		}
	})
}


function updateUser(userId, userUpdate, callback) {
	redisLib.getHash(config.usersKey+userId, function(error, user) {
		if (error) return callback (error, null);
		if (user) {
			updateFieldUser(user, userUpdate, function (err, response) {
				if (err) callback(err, null);
				return callback(null, response);
			})
		} else {
			return callback(null, null);
		}

	});
}

function deleteUser(userId, callbackDelete) {
	async.waterfall([
	    function removeFromUser(callback) {
	    	redisLib.deleteKey(config.usersKey+userId, function(err, response) {
				if (err) callbackDelete(err, null);
				callback(null);
			});
	    },
	    function removeFromPreferences(callback) {
	    	redisLib.deleteKey(config.preferencesKey+userId, function(err, response) {
				if (err) callbackDelete(err, null);
				callback(null);
			});
	    },
	    function removeFromGender(callback) {
	    	redisLib.removeFromSet(config.genderKey+'male', userId, function(err, response) {
				if (err) callbackDelete(err, null);
				redisLib.removeFromSet(config.genderKey+'female', userId, function(err, response) {
					if (err) callbackDelete(err, null);
					redisLib.removeFromSet(config.genderKey+'both', userId, function(err, response) {
						if (err) callbackDelete(err, null);
						return callback(null);
					});
				});
			
			});
	    },
	    function removeFromAround(callback) {
	    	redisLib.keys(config.aroundKey+'*', function(err, aroundKeyIds) {
	    		console.log(aroundKeyIds);
	    		async.each(aroundKeyIds, function (key, cb) {
					redisLib.deleteKey(key, function(err, response) {
						if (err) callbackDelete(err, null);
						return cb();
					});
				}, function finish(err) {
					callback(null);
				});
	    	});
	    }
	], function (error) {
	    if (error) {
	    	return callbackDelete(error, null);
	    }
	    callbackDelete(null, "OK");
	});
} 

function updateFieldUser(user, userUpdate, cbUpdate) {
	async.forEach(Object.keys(userUpdate), function (userField, callback){ 
	    if (userUpdate[userField] instanceof Array) {
	    	userUpdate[userField] = JSON.stringify(userUpdate[userField]);
	    }
	    redisLib.setHashField(config.usersKey+user.id,userField,userUpdate[userField], function (err, response) {
			if (err) return cbUpdate(err, null);
			callback();
		});

	}, function(err) {
		if (err) return cbUpdate(err, null);
	    cbUpdate(null, "OK");
	});  
}

function parseUser(facebookUser, callbackUser) {
	async.waterfall([
	    function parseCbLikes(callback) {
	    	parseLikes(facebookUser.likes.data, function (likes) {
	    		callback(null, likes);
	    	});
	    },
	    function parseCbEducation(likes, callbackEducation) {
	    	parseEducation(facebookUser.education, function(education) {
	    		callbackEducation(null, likes, education);
	    	})
	    }
	], function (error, likes, education) {
	    if (error) {
	    }
	    var user = {
			id: facebookUser.id,
			userName: facebookUser.name,
			picture: facebookUser.picture.data.url,
			likes: JSON.stringify(likes),
			gender: facebookUser.gender,
			education: JSON.stringify(education),
			description: "",
			pictures: ""
		}
		
	    callbackUser(user);
	});

}

function parseLikes(likes, callbackLikes) {
	var likesParsed = [];
	async.each(likes, function (like, callback) {
		var likeObj = {
			name: like.name
		};

		likesParsed.push(likeObj);
		callback();
	}, function finish(err) {
		callbackLikes(likesParsed);
	});
}

function parseEducation(educations, cbEducation) {
	var educationParsed = [];
	async.each(educations, function (education, callback) {
		var eduObj = {
			name: education.school.name,
			type: education.type
		};

		educationParsed.push(eduObj);
		callback();
	}, function finish(err) {
		cbEducation(educationParsed);
	});
}

module.exports = {
	getUser: getUser,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser,
	parseUser: parseUser
}