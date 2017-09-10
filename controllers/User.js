'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');

var userKey = 'user_';

function getUser(userId, callback) {
	redisLib.getHash(userKey+userId, function(err,response) {
		if (err) callback(err, null);
		return callback(null, response);
	})
}

// limit para paginacion
function getUsers(callback) {
	redisLib.getHash(userKey, function(err, response) {
		if (err) callback(err, null);
		return callback(null, response);
	})
}


function createUser(userId, user, callback) {
	redisLib.exists(userKey+userId, function(err, exists) {
		if (exists) {
			return callback(null, null);
		} else {
			redisLib.setHash(userKey+userId, user, function (err, response) {
				if (err) return callback(err, null);
				return callback(null, response);
			}); 		
		}
	})
}


function updateUser(userId, userUpdate, callback) {
	redisLib.getHash(userKey+userId, function(error, user) {
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

function deleteUser(userId, callback) {
	redisLib.deleteKey(userKey+userId, function(err, response) {
		if (err) callback(err, null);
		return callback(null, response);
	});
} 

function updateFieldUser(user, userUpdate, cbUpdate) {
	async.forEach(Object.keys(userUpdate), function (userField, callback){ 
	    if (userUpdate[userField] instanceof Array) {
	    	userUpdate[userField] = JSON.stringify(userUpdate[userField]);
	    }
	    redisLib.setHashField(userKey+user.id,userField,userUpdate[userField], function (err, response) {
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
			education: JSON.stringify(education)
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