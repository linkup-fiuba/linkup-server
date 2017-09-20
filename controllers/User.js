'use strict';
var async 			= require('async');
var redisLib 		= require('../redisLib');
var config	 		= require('../config');
var elasticSearch 	= require('../elasticSearchLib');

function getUser(userId, callback) {
	redisLib.getHash(config.usersKey+userId, function(err,response) {
		if (err) return callback(err, null);
		if (response) {
			var user = {
				id: response.id,
				name: response.name,
				birthday: response.birthday,
				age: response.age,
				picture: response.picture,
				likes: JSON.parse(response.likes),
				gender: response.gender,
				education: JSON.parse(response.education),
				description: response.description,
				pictures: JSON.parse(response.pictures)
			}
			return callback(null, user);
		} else {
			return callback(null, null);
		}
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
				if (err) return callback (err, null);
				redisLib.addToSet(config.genderKey+config.bothKey, userId, function (err, reply) {
					if (err) return callback(err, null);
					redisLib.setHash(config.usersKey+userId, user, function (err, response) {
						if (err) return callback(err, null);
						var userModel = {
							id: userId,
							name: user.name,
							birthday: user.birthday,
							age: user.age,
							picture: user.picture,
							likes: JSON.parse(user.likes),
							gender: user.gender,
							education: JSON.parse(user.education),
							description: user.description,
							pictures: JSON.parse(user.pictures)
						}
						return callback(null, userModel);
					});

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
				if (err) return callbackDelete(err, null);
				callback(null);
			});
	    },
	    function removeFromPreferences(callback) {
	    	redisLib.deleteKey(config.preferencesKey+userId, function(err, response) {
				if (err) return callbackDelete(err, null);
				callback(null);
			});
	    },
	    function removeFromGender(callback) {
	    	redisLib.removeFromSet(config.genderKey+'male', userId, function(err, response) {
				if (err) return callbackDelete(err, null);
				redisLib.removeFromSet(config.genderKey+'female', userId, function(err, response) {
					if (err) return callbackDelete(err, null);
					redisLib.removeFromSet(config.genderKey+'both', userId, function(err, response) {
						if (err) return callbackDelete(err, null);
						return callback(null);
					});
				});
			
			});
	    },
	    function removeFromAround(callback) {
	    	redisLib.keys(config.aroundKey+'*', function(err, aroundKeyIds) {
	    		async.each(aroundKeyIds, function (key, cb) {
					redisLib.deleteKey(key, function(err, response) {
						if (err) return callbackDelete(err, null);
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
	    return callbackDelete(null, "OK");
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
	    return cbUpdate(null, "OK");
	});  
}

function parseUser(facebookUser, callbackUser) {
	async.waterfall([
	    function parseCbLikes(callback) {
	    	if (facebookUser.likes ? true : false ) {
		    	parseLikes(facebookUser.likes.data, function (likes) {
		    		callback(null, likes);
		    	});
	    	} else {
	    		callback(null, []);
	    	}
	    },
	    function parseCbEducation(likes, callbackEducation) {
	    	if (facebookUser.education ? true : false ) {
		    	parseEducation(facebookUser.education, function(education) {
		    		callbackEducation(null, likes, education);
		    	})
	    	} else {
	    		callbackEducation(null, [], []);
	    	}
	    }
	], function (error, likes, education) {
	    if (error) {
	    }
	    var user = {
			id: facebookUser.id,
			name: facebookUser.name ? facebookUser.name : "",
			birthday: facebookUser.birthday ? facebookUser.birthday : "",
			age: facebookUser.age ? facebookUser.age : "",
			picture: facebookUser.picture.data.url ? facebookUser.picture.data.url : "",
			likes: JSON.stringify(likes),
			gender: facebookUser.gender,
			education: JSON.stringify(education),
			description: "",
			pictures: JSON.stringify([])
		}
		
	    return callbackUser(user);
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
		return callbackLikes(likesParsed);
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
		return cbEducation(educationParsed);
	});
}

function parseUserForElasticSearch(userId, preferences, callback) {
	redisLib.getHash(config.usersKey+userId, function(err, user) {
		if (err) return callback(err, null);
		if (user) {			
			var userES = {
				userId: user.id,
				location: (user.location) ? JSON.parse(user.location) : '' ,
				age: user.age,
				gender: user.gender,
				mode: preferences.mode,
				searchMode: preferences.searchMode
			}
			elasticSearch.addToIndex('users', 'user', userId, userES, function(error, response) {
				return callback(null, response);
			})
		} else {
			return callback(null, null);
		}
	})
}

module.exports = {
	getUser: getUser,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser,
	parseUser: parseUser,
	parseUserForElasticSearch: parseUserForElasticSearch
}