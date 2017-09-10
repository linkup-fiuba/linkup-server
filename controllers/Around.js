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

function createAroundUser(userId, callbackAround) {
	var responseSave = 0;
	async.waterfall([
	    function (callback) {
	    	//get info of my user
	    	redisLib.getHash(config.usersKey+userId, function (err, user) {
	    		if (err) return callbackAround(err, null);
	    		if (!user) {
	    			return callbackAround(null, null);
	    		}
	    		redisLib.getHashField(config.preferencesKey+userId, 'gender', function (err, userGenderPreferences) {
					if (err) return callbackAround(err, null);
					callback(null, user ,userGenderPreferences);
				});
	    	});
	    },
	    function getUserList(user, userGenderPreferences, callback) {
	    	//obtengo todos los ids de los usuarios de preferencia del user actual
	    	redisLib.getFromSet(config.genderKey+userGenderPreferences, function (err, usersIds) {
				if (err) callbackAround(err, null);
				callback(null, user, userGenderPreferences, usersIds);
			});
	    },
	    function (user, userGenderPreferences, usersIds, callback) {
		    async.each(usersIds, function (id, callbackIt) {
				if (userId == id) {
					return callbackIt();
				}
				async.waterfall([
					function (cb) {
						redisLib.getHash(config.usersKey+id, function (err, otherUser) {
							if (err) return callbackAround(err, null);
							cb(null, user, otherUser);
						});
					},
				    function (user, otherUser, cb) {
				    	//obtengo la preferencia del otro user
				    	redisLib.getHashField(config.preferencesKey+id, 'gender', function (err, userPref) {
				    		//valido si puede haber match
				    		validatePossibleAround(user.gender, userGenderPreferences, otherUser.gender, userPref, function (validate) {
				    			if (validate) {
				    				//agrego a la lista de los around
				    				redisLib.addToSet(config.aroundKey+userId, id, function (err, reply) {
				    					if (err) return callbackAround(err, null);
										redisLib.addToSet(config.aroundKey+id, userId, function(err, reply) {
											if (err) return callbackAround(err, null);
											cb(null, otherUser);
										});
									});
				    			} else {
				    				callbackIt();
				    			}
				    		})
				    	});
				    }, 
				    function (otherUser, cb) {
				    	var userModel = {
							id: id,
							userName: otherUser.userName,
							description: otherUser.description,
							picture: otherUser.picture,
							compatibility: 1
						};

						var actualUserModel = {
							id: id,
							userName: user.userName,
							description: user.description,
							picture: user.picture,
							compatibility: 1
						};
						//save info of around 
						redisLib.setHash(config.aroundKey+userId+':'+id, userModel, function (err, responseSave) {
							if (err) return callbackAround(err, null);
							redisLib.setHash(config.aroundKey+id+':'+userId, actualUserModel, function (err, responseSave) {
								if (err) return callbackAround(err, null);
								callbackIt();
							})
						})
				    }
				], function (error) {
					//fin segundo waterfall
				    if (error) {
				    	return callback(error, null);
				    }
				 
				    callback(responseSave);
				});
			}, function finish(err) {
				//fin foreach
				if (err) return callbackAround(err, null);
				callback(null);
			});
	    }
	], function (error) {
		// fin primer waterfall
	    if (error) {
	    	return callbackAround(error, null);
	    }
	    callbackAround(null, "OK");
	});
}

//para hacerlo mas generico podria pasar los users y las pref completas

function validatePossibleAround(userGender, userGenderPreferences, otherUserGender, otherUserGenderPref, callback) {
	if (userGender == 'male' && userGenderPreferences == 'male' && otherUserGender == 'male' && otherUserGenderPref == 'male') {
		return callback(true);
	} else if (userGender == 'male' && userGenderPreferences == 'female' && otherUserGender == 'female' && otherUserGenderPref == 'male') {
		return callback(true);
	} else if (userGender == 'male' && userGenderPreferences == 'both' && otherUserGenderPref == 'both') {
		return callback(true);
	} else if (userGender == 'female' && userGenderPreferences == 'male' && otherUserGender == 'male' && otherUserGenderPref == 'female') {
		return callback(true);
	} else if (userGender == 'female' && userGenderPreferences == 'female' && otherUserGender == 'female' && otherUserGenderPref == 'female') {
		return callback(true);
	} else if (userGender == 'female' && userGenderPreferences == 'both' && otherUserGenderPref == 'both') {
		return callback(true);
	} else {
		callback(false);
	}

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