'use strict';
var async 			= require('async');
var redisLib 		= require('../redisLib');
var config	 		= require('../config');
var elasticSearch 	= require('../elasticSearchLib');

function getAroundUsers(userId, callback) {
	async.waterfall([
	    function (cb) {
	    	redisLib.getFromSet(config.aroundKey+userId, function(err, userIdSet) {
				if (err) cb(err, null);
				if (userIdSet) {
					return cb(null, userIdSet );
				}
			});
	    },
	    function (userIdSet, cb) {
	    	redisLib.getFromSet(config.aroundKey+userId+config.shown, function(err, userIdSetShown) {
				if (err) return cb(err, null);
				if (userIdSetShown) {
					return cb(null, userIdSet, userIdSetShown );
				}
			});
	    },
	    function (userIdSet, userIdSetShown, cb) {
	    	getUsersAround(userId, userIdSet, userIdSetShown, function (err, users) {
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

/*function createAroundUser(userId, callbackAround) {
	var responseSave = 0;
	async.waterfall([
	    function (callback) {
	    	//get info of my user
	    	redisLib.getHash(config.usersKey+userId, function (err, user) {
	    		if (err) return callbackAround(err, null);
	    		if (!user) {
	    			return callbackAround(null, null);
	    		}
	    		redisLib.getHash(config.preferencesKey+userId, function (err, userPreferences) {
					if (err) return callbackAround(err, null);
					if (userPreferences.mode != "invisible") {

						return callback(null, user ,userPreferences);
					} else{ 
						return callbackAround(null, []);
					}
				});
	    	});
	    },
	    function (user, userPreferences, callback) {
	    	//obtengo todos los ids de los usuarios de preferencia del user actual
	    	redisLib.getFromSet(config.genderKey+userPreferences.gender, function (err, usersIds) {
				if (err) callbackAround(err, null);
				return callback(null, user, userPreferences, usersIds);
			});
	    },
	    function (user, userPreferences, usersIds, callback) {
		    async.each(usersIds, function (id, callbackIt) {
				if (userId == id) {
					return callbackIt();
				}
				async.waterfall([
					function (cb) {
						redisLib.getHash(config.usersKey+id, function (err, otherUser) {
							if (err) return cb(err, null);
							return cb(null, user, otherUser);
						});
					},
				    function (user, otherUser, cb) {
				    	//obtengo la preferencia del otro user
				    	redisLib.getHashField(config.preferencesKey+id, 'gender', function (err, userPref) {
				    		//valido si puede haber match
				    		validatePossibleAround(user.gender, userPreferences.gender, otherUser.gender, userPref, function (validate) {
				    			if (validate) {
				    				//agrego a la lista de los around
				    				redisLib.addToSet(config.aroundKey+userId, id, function (err, reply) {
				    					if (err) return cb(err, null);
										redisLib.addToSet(config.aroundKey+id, userId, function(err, reply) {
											if (err) return cb(err, null);
											return cb(null, otherUser);
										});
									});
				    			} else {
				    				return callbackIt();
				    			}
				    		})
				    	});
				    }, 
				    function (otherUser, cb) {

				    	var userModel = {
							id: id,
							name: otherUser.name,
							description: otherUser.description,
							picture: otherUser.picture,
							compatibility: 1
						};

						var actualUserModel = {
							id: userId,
							name: user.name,
							description: user.description,
							picture: user.picture,
							compatibility: 1
						};

						//save info of around 
						redisLib.setHash(config.aroundKey+userId+':'+id, userModel, function (err, responseSave) {
							if (err) return cb(err, null);
							redisLib.setHash(config.aroundKey+id+':'+userId, actualUserModel, function (err, responseSave) {
								if (err) return cb(err, null);
								return callbackIt();
							})
						})
				    }
				], function (error) {
					//fin segundo waterfall
				    if (error) {
				    	return callback(error, null);
				    }
				 
				    return callback(responseSave);
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
*/

function createAroundUser(userId, userPreferences, callbackAround) {
	var responseSave = 0;
	if (userPreferences.mode == "invisible") {
		return callbackAround(null, []);
	}
	async.waterfall([
	    function (callback) {
	    	//get info of my user
	    	redisLib.getHash(config.usersKey+userId, function (err, user) {
	    		if (err) return callbackAround(err, null);
	    		if (!user) {
	    			return callbackAround(null, null);
	    		} else {
					return callback(null, user, userPreferences);
	    		}
	    	});
	    },
	    function (user, userPreferences, callback) {
	    	//console.log(" === USER ===");
	    	//console.log(user);
	    	//console.log(" === USER PREFERENCES ===");
	    	//console.log(userPreferences);
			var defaultLocation = {
				lat: -34.55,
				lon: -58.44
			}

	    	var preferences = {
	    		query: {
	    			bool: {
	    				must: [
	    					{ match: { gender: userPreferences.gender} },
	    					{ match: { mode: userPreferences.mode} },
	    					{ match: { searchMode: userPreferences.searchMode} }
	    				],
	    				filter: [
	    					{ 
	    						geo_distance: { 
		    						distance: userPreferences.distance+config.distanceUnit,
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

	    	elasticSearch.searchInIndex('users', 'user', preferences, function(err, usersMatched) {
	    		if (err) {
	    			//console.log("err searching");
	    			//console.log(err);
	    			return callbackAround(err, []);
	    		} else if (usersMatched.length > 0) {
	    			console.log(" === USERS FOUND ===");
	    			//console.log(usersMatched);
	    			return callback(null, user, userPreferences, usersMatched);
	    		} else {
	    			console.log(" === USERS NOT FOUND ===");
	    			return callback(null, user, userPreferences, []);
	    		}
	    	})
	    },
	    function (user, userPreferences, usersMatched, callback) {
	    	var usersMatch = [];
			async.each(usersMatched, function (userMatch, cb) {
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
		    	console.log("users matched");
		    	console.log(usersMatch);
				return callback(null, user, userPreferences, usersMatch);
			});
	    },
	    function (user, userPreferences, usersMatched, callback) {
	    	//console.log("users matched after");
	    	//console.log(usersMatched);
		    async.each(usersMatched, function (userMatch, callbackIt) {
				if (userId == userMatch.id) {
					return callbackIt();
				}
				async.waterfall([
					function (cb) {
						//parse elastic search response
						redisLib.getHash(config.usersKey+userMatch.id, function (err, otherUser) {
							if (err) return callbackIt(err, null);
							return cb(null, user, otherUser);
						});
					},
				    function (user, otherUser, cb) {
				    	//obtengo la preferencia del otro user
				    	redisLib.getHashField(config.preferencesKey+userMatch.id, 'gender', function (err, userPref) {
				    		//valido si puede haber match
				    		validatePossibleAround(user.gender, userPreferences.gender, otherUser.gender, userPref, function (validate) {
				    			if (validate) {
				    				//agrego a la lista de los around
				    				redisLib.addToSet(config.aroundKey+userId, userMatch.id, function (err, reply) {
				    					if (err) return callbackAround(err, null);
										redisLib.addToSet(config.aroundKey+userMatch.id, userId, function(err, reply) {
											if (err) return callbackAround(err, null);
											return cb(null, user, otherUser);
										});
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
							compatibility: 1
						};

						var actualUserModel = {
							id: user.id,
							name: user.name,
							description: user.description,
							picture: user.picture,
							compatibility: 1
						};

						//save info of around 
						redisLib.setHash(config.aroundKey+userId+':'+userMatch.id, userModel, function (err, responseSave) {
							if (err) return cb(err, null);
							redisLib.setHash(config.aroundKey+userMatch.id+':'+userId, actualUserModel, function (err, responseSave) {
								if (err) return cb(err, null);
								return callbackIt();
							})
						})
				    }
				], function (error) {
					//fin segundo waterfall
				    if (error) {
				    	return callbackAround(error, null);
				    }
				 
				    return cb(null);
				});
			}, function finish(err) {
				//fin foreach
				if (err) return callbackAround(err, null);
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
		return callback(false);
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
	    return callbackDelete(null, "OK");
	});

}

function deleteAroundUsers(userId, callbackDelete) {
	redisLib.getFromSet(config.aroundKey+userId, function(err, userIdSet) {
		if (err) callbackDelete(err, null);
		if (userIdSet) {
			async.each(userIdSet, function (id, cb) {
					
				async.waterfall([
				    function (callback) {
						redisLib.removeFromSet(config.aroundKey+userId, id, function (err, replySet) {
							if (err) return callbackDelete(err, null);
							return callback(null);
						})
				    },
				    function (callback) {
				    	redisLib.removeFromSet(config.aroundKey+id, userId, function (err, replySetTwo) {
							if (err) return callbackDelete(err, null);
							return callback(null);
						})
				    },
				    function (callback) {
				    	redisLib.deleteKey(config.aroundKey+userId+':'+id, function (err, replyRemOne) {
							if (err) return callbackDelete(err, null);
							redisLib.deleteKey(config.aroundKey+id+':'+userId, function (err, replyRemTwo) {
								if (err) return callbackDelete(err, null);
								return callback(null);
							})		
						})
				    }
				], function (error) {
				    if (error) {
				    	return callbackDelete(error, null);
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

function getUsersAround(userId, userIdsAround, userIdsAroundShown, cbUserAround) {
	var limit = config.limit;
	var i = 0;
	if (userIdsAround.length == 0) {
		return cbUserAround(null, []);
	}
	async.waterfall([
	    function getDiff(callback) {
	    	//chequeo cuales mostre
	    	var arrayDiff = userIdsAround.diff(userIdsAroundShown);
	    	//mostre todos
			if (arrayDiff.length == 0) {
				arrayDiff = userIdsAround;
				redisLib.deleteKey(config.aroundKey+userId+config.shown, function (err, replyRem) {
					if (err) return callback(err, null);
					return callback(null, arrayDiff);
				});	
			} else {
				return callback(null, arrayDiff);
			}
	    },
	    function iterate(arrayDiff, callbackIteration) {
	    	var users = [];
	    	async.each(arrayDiff, function (id, callbackIds) {
				redisLib.getHash(config.aroundKey+userId+':'+id, function (err, user) {
					if (i == limit) {
						return callbackIteration(null, users);
					} else {
						i++;
						if (user != null) {
							var userModel = {
	        					id: id,
								name: user.name,
	        					picture: user.picture,
								description: user.description,
								compatibility: user.compatibility
							};
							users.push(userModel);
							redisLib.addToSet(config.aroundKey+userId+config.shown, id, function(err, response) {
								return callbackIds();
							})
						} else {
							return callbackIds();
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
	createAroundUser: createAroundUser,
	deleteAroundUsers: deleteAroundUsers
}