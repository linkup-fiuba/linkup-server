'use strict';

function Around(config) {
	this.config = config;
	this.getAroundUsers = getAroundUsers;
	this.createAroundUser = createAroundUser;
	this.deleteAroundUser = deleteAroundUser;
	this.deleteAroundUsers = deleteAroundUsers;
}

function createAroundController(config) {
	return new Around(config);
}

function getAroundUsers(userId, callback) {
	var config = this.config;
	config.async.waterfall([
	    function (cb) {
	    	config.redisLib.getFromSet(config.aroundKey+userId, function(err, userIdSet) {
				if (err) cb(err, null);
				if (userIdSet) {
					return cb(null, userIdSet );
				}
			});
	    },
	    function (userIdSet, cb) {
	    	config.redisLib.getFromSet(config.aroundKey+userId+config.shown, function(err, userIdSetShown) {
				if (err) return cb(err, null);
				if (userIdSetShown) {
					return cb(null, userIdSet, userIdSetShown );
				}
			});
	    },
	    function (userIdSet, userIdSetShown, cb) {
	    	getUsersAround(config, userId, userIdSet, userIdSetShown, function (err, users) {
				if (err) return cb(err, null);
				if (users) {
					return cb(null, users);
				}
			});
	    }
	], function (error, users) {
	    if (error) {
	    	return callback(error, null);
	    }
	   
	    return callback(null, users);
	});
}

function createAroundUser(userId, userPreferences, callbackAround) {
	var config = this.config;
	var responseSave = 0;
	if (userPreferences.mode == "invisible") {
		return callbackAround(null, []);
	}
	var distanceUnit = null;
	config.redisLib.getHashField('config', 'distanceUnit', function(err, res) {
		distanceUnit = res;
	});
	config.async.waterfall([
	    function (callback) {
	    	//get info of my user
	    	config.redisLib.getHash(config.usersKey+userId, function (err, user) {
	    		if (err) return callback(err, null, null);
	    		if (!user) {
	    			return callbackAround(null, []);
	    		} else {
					return callback(null, user, userPreferences);
	    		}
	    	});
	    },
	    function (user, userPreferences, callback) {
	    	if (user == null) {
	    		return callback(null, null);
	    	}
			var defaultLocation = {
				lat: -34.55,
				lon: -58.44
			}

			var matches = [
	    		{ match: { mode: userPreferences.mode} },
	    		{ match: { searchMode: userPreferences.searchMode} }
			];

			if (userPreferences.gender != 'both') {
				matches.push({ match: { gender: userPreferences.gender} });
			}

	    	var preferences = {
	    		query: {
	    			bool: {
	    				must: matches,
	    				filter: [
	    					{ 
	    						geo_distance: { 
		    						distance: userPreferences.distance+(distanceUnit ? distanceUnit : config.distanceUnitDefault),
		    						location: (user.location) ? JSON.parse(user.location) : defaultLocation
		    					}
	    					},
	    					{
	    						range: {
	    							age: {
	    								gte: userPreferences.minAge,
	    								lte: userPreferences.maxAge
	    							}
	    						}
	    					}
	    				]
	    			}
	    		}
	    	}



	    	config.ESLib.searchInIndex('users', 'user', preferences, function(err, usersMatched) {
	    		if (err) {
	    			return callback(err, null);
	    		} else if (usersMatched.length > 0) {
	    			return callback(null, user, userPreferences, usersMatched);
	    		} else {
	    			return callback(null, user, userPreferences, []);
	    		}
	    	})
	    },
	    function (user, userPreferences, usersMatched, callback) {
	    	var usersMatch = [];
			config.async.each(usersMatched, function (userMatch, cb) {
				userMatch = userMatch._source;
				var match = {
					id: userMatch.userId,
					location: userMatch.location,
					age: userMatch.age,
					gender: userMatch.gender,
					mode: userMatch.mode,
					searchMode: userMatch.searchMode
				};

				usersMatch.push(match);
				cb();
			}, function finish(err) {
				if (err) {
					return callback(err, null);
				}
				return callback(null, user, userPreferences, usersMatch);
			});
	    },
	    function (user, userPreferences, usersMatched, callback) {
		    config.async.each(usersMatched, function (userMatch, callbackIt) {
				if (userId == userMatch.id) {
					return callbackIt();
				}
				config.async.waterfall([
					function (cb) {
						//parse elastic search response
						config.redisLib.getHash(config.usersKey+userMatch.id, function (err, otherUser) {
							if (err) return callback(err, null);
							if (!otherUser) return callbackIt();
							else {
								return cb(null, user, otherUser);
							}
						});
					},
				    function (user, otherUser, cb) {
				    	//obtengo la preferencia del otro user
				    	config.redisLib.getHashField(config.preferencesKey+userMatch.id, 'gender', function (err, userPref) {
				    		//valido si puede haber match
				    		validatePossibleAround(user.gender, userPreferences.gender, otherUser.gender, userPref, function (validate) {
				    			if (validate) {
				    				//agrego a la lista de los around
				    				config.redisLib.addToSet(config.aroundKey+userId, userMatch.id, function (err, reply) {
				    					if (err) return callback(err, null);
										return cb(null, user, otherUser);
									});
				    			} else {
				    				return callbackIt();
				    			}
				    		})
				    	});
				    }, 
				    function (user, otherUser, cb) {

				    	var userModel = {
							id: userMatch.id,
							name: otherUser.name,
							description: otherUser.description,
							picture: otherUser.picture,
							like: false
						};

						//save info of around 
						config.redisLib.setHash(config.aroundKey+userId+':'+userMatch.id, userModel, function (err, responseSave) {
							if (err) return cb(err, null);
							return callbackIt();
		
						})
				    }
				], function (error) {
					//fin segundo waterfall
				    if (error) {
				    	return callback(error, null);
				    }
				 
				    return cb(null);
				});
			}, function finish(err) {
				//fin foreach
				if (err) return callback(err, null);
				return callback(null);
			});
	    }
	], function (error) {
		// fin primer waterfall
	    if (error) {
	    	return callbackAround(error, null);
	    }
	    return callbackAround(null, "OK");
	});
}

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
		return callback(false);
	}

}

function deleteAroundUser(userId, userIdRemove, callbackDelete) {
	var config = this.config;
	config.async.waterfall([
	    function (callback) {
			config.redisLib.removeFromSet(config.aroundKey+userId, userIdRemove, function (err, replySet) {
				if (err) return callback(err, null);
				return callback(null);
			})
	    },
	    function (callback) {
	    	config.redisLib.deleteKey(config.aroundKey+userId+':'+userIdRemove, function (err, replyRemOne) {
				if (err) return callback(err, null);
				return callback(null);		
			})
	    }
	], function (error) {
	    if (error) {
	    	return callbackDelete(error, null);
	    }
	    return callbackDelete(null, "OK");
	});

}

function deleteAroundUsers(userId, callbackDelete) {
	var config = this.config;
	config.redisLib.getFromSet(config.aroundKey+userId, function(err, userIdSet) {
		if (err) callbackDelete(err, null);
		if (userIdSet) {
			config.async.each(userIdSet, function (id, cb) {
					
				config.async.waterfall([
				    function (callback) {
						config.redisLib.removeFromSet(config.aroundKey+userId, id, function (err, replySet) {
							if (err) return callback(err, null);
							return callback(null);
						})
				    },
				    function (callback) {
				    	config.redisLib.removeFromSet(config.aroundKey+id, userId, function (err, replySetTwo) {
							if (err) return callback(err, null);
							return callback(null);
						})
				    },
				    function (callback) {
				    	config.redisLib.deleteKey(config.aroundKey+userId+':'+id, function (err, replyRemOne) {
							if (err) return callback(err, null);
							config.redisLib.deleteKey(config.aroundKey+id+':'+userId, function (err, replyRemTwo) {
								if (err) return callback(err, null);
								return callback(null);
							})		
						})
				    }
				], function (error) {
				    if (error) {
				    	return callback(error, null);
				    }
				    return cb();
				});
			}, function finish(err) {
				callbackDelete(null, userIdSet);
			});
		} else {
			return callbackDelete(null, null);
		}
	});


}  

function getUsersAround(config, userId, userIdsAround, userIdsAroundShown, cbUserAround) {
	var limit = null;
	config.redisLib.getHashField('config', 'limit', function(err, res) {
		if (err) limit = config.limitDefault;
		if (res) limit = res;
		else limit = config.limitDefault;
	});
	var i = 0;
	if (userIdsAround.length == 0) {
		return cbUserAround(null, []);
	}
	config.async.waterfall([
	    function getDiff(callback) {
	    	//chequeo cuales mostre
	    	var arrayDiff = userIdsAround.diff(userIdsAroundShown);
	    	//mostre todos
			if (arrayDiff.length == 0) {
				arrayDiff = userIdsAround;
				config.redisLib.deleteKey(config.aroundKey+userId+config.shown, function (err, replyRem) {
					if (err) return callback(err, null);
					return callback(null, arrayDiff);
				});	
			} else {
				return callback(null, arrayDiff);
			}
	    },
	    function iterate(arrayDiff, callback) {
	    	var users = [];
	    	config.async.each(arrayDiff, function (id, callbackIds) {
				config.redisLib.getHash(config.aroundKey+userId+':'+id, function (err, user) {
					if (i == limit) {
						return callback(null, users);
					} else {
						i++;
						if (user != null) {
							var userModel = {
	        					id: id,
								name: user.name,
	        					picture: user.picture,
								description: user.description,
								like: user.like
							};
							users.push(userModel);
							config.redisLib.addToSet(config.aroundKey+userId+config.shown, id, function(err, response) {
								return callbackIds();
							})
						} else {
							return callbackIds();
						}
					}
				})

			}, function finish(err) {
	    		return callback(null, users);
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
	createAroundController: createAroundController,
	getAroundUsers: getAroundUsers,
	deleteAroundUser: deleteAroundUser,
	createAroundUser: createAroundUser,
	deleteAroundUsers: deleteAroundUsers
}