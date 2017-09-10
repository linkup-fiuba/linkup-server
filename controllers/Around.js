'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');
var config	 	= require('../config');

function getAroundUsers(userId, callback) {
	redisLib.getFromSet(config.aroundKey+userId, function(err, userIdSet) {
		if (err) callback(err, null);
		redisLib.getFromSet(config.aroundKey+userId+config.shown, function(err, userIdSetShown) {
			getUsersAround(userId, userIdSet, userIdSetShown, function (err, users) {
				if (err) return callback(err, null);
				return callback(null, users);
			})
		})
	})
}

function createAroundUser(userId, callback) {
	var responseSave = 0;
	/*async.waterfall([
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
	});*/
	redisLib.getHash(config.usersKey+userId, function (err, user) {
		// get possible matches by gender
	redisLib.getHashField(config.preferencesKey+userId, 'gender', function (err, userPreferences) {
		if (err) return callback(err, null);
		console.log("userPreferences");
		console.log(userPreferences);
		async.waterfall([
		    function getUserList(cb) {
		    	redisLib.getFromSet(config.genderKey+userPreferences, function (err, usersIds) {
					if (err) callback(err, null);
					console.log("usersIds");
					console.log(usersIds);
					cb(null, usersIds);
				});
		    },
		    function parseUsers(usersIds, cb) {
		    	console.log("aqui");
		    	console.log(usersIds);
				async.each(usersIds, function (id, callbackIt) {
					if (userId == id) {
						console.log("SAME USER");
						return callbackIt();
					}
					console.log("id");
					console.log(id);
					redisLib.getHashField(config.preferencesKey+id, 'gender', function (err, userPref) {
						if ((userPreferences == 'male' && userPref == 'female') || (userPreferences == 'female' && userPref == 'male')
						 	|| (userPreferences == 'male' && userPref == 'male')  || (userPreferences == 'female' && userPref == 'female') 
						 	|| (userPreferences == 'both' && userPref == 'both')) {

							redisLib.addToSet(config.aroundKey+userId, id, function (err, reply) {
								redisLib.addToSet(config.aroundKey+id, userId, function(err, reply) {
									if (err) return callback(err, null);
									redisLib.getHash(config.usersKey+id, function (err, userSave) {
										console.log("userSave");
										console.log(userSave);
										if (err) return callback(err, null);
										var userModel = {
											id: id,
											userName: userSave.userName,
											description: userSave.description,
											picture: userSave.picture,
											compatibility: 1
										};
										redisLib.setHash(config.aroundKey+userId+':'+id, userModel, function (err, responseSave) {
											console.log(responseSave);
											if (err) return callback(err, null);
											redisLib.setHash(config.aroundKey+id+':'+userId, user, function (err, responseSave) {
												console.log(responseSave);
												if (err) return callback(err, null);
													

												callbackIt();
											})
										})
									})
								})
							});
						}
					});

				}, function finish(err) {
					if (err) return cb(err);
					cb(null);
				});

		    }
		], function (error) {
		    if (error) {
		    	return callback(error, null);
		    }
		 
		    callback(responseSave);
		});

	})
	});
	
}

function deleteAroundUser(userId, userIdRemove, callbackDelete) {
	async.waterfall([
	    function (callback) {
			redisLib.removeFromSet(config.aroundKey+userId, userIdRemove, function (err, replySet) {
				if (err) return callbackDelete(err, null);
				return callback(null);
			})
	    },
	    function (callback) {
	    	redisLib.removeFromSet(config.aroundKey+userIdRemove, userId, function (err, replySetTwo) {
				if (err) return callbackDelete(err, null);
				return callback(null);
			})
	    },
	    function (callback) {
	    	redisLib.deleteKey(config.aroundKey+userId+':'+userIdRemove, function (err, replyRemOne) {
				if (err) return callbackDelete(err, null);
				redisLib.deleteKey(config.aroundKey+userIdRemove+':'+userId, function (err, replyRemTwo) {
					if (err) return callbackDelete(err, null);
					return callback(null);
				})		
			})
	    }
	], function (error) {
	    if (error) {
	    	return callbackDelete(error, null);
	    }
	    callbackDelete(null, "OK");
	});

} 

function getUsersAround(userId, userIdsAround, userIdsAroundShown, cbUserAround) {
	var users = [];
	
	var limit = config.limit;
	var i = 0;

	async.waterfall([
	    function getDiff(callback) {
	    	var arrayDiff = userIdsAround.diff(userIdsAroundShown);
			if (arrayDiff.length == 0) {
				arrayDiff = userIdsAround;
				redisLib.deleteKey(config.aroundKey+userId+config.shown, function (err, replyRem) {
					if (err) return callback(err, null);
					callback(null, arrayDiff);
				});	
			} else {
				callback(null, arrayDiff);
			}
	    },
	    function iterate(arrayDiff, callbackIteration) {
	    	async.each(arrayDiff, function (id, callbackIds) {
				redisLib.getHash(config.aroundKey+userId+':'+id, function (err, user) {
					if (!user) {
						callbackIds();
					} else {
						if (i == limit) {
							return callbackIds(null, users);
						} else {
							i++;
							users.push(user);
							redisLib.addToSet(config.aroundKey+userId+config.shown, id, function(err, response) {
								callbackIds();
							})
						}
					}
				})

			}, function finish(err) {
	    		return callbackIteration(null, users);
			});
	    	
	    }
	], function (error, users) {
	    if (error) {
	    	return cbUserAround(error, null);
	    }
	    return cbUserAround(null, users);
	});

}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

module.exports = {
	getAroundUsers: getAroundUsers,
	deleteAroundUser: deleteAroundUser,
	createAroundUser: createAroundUser
}