'use strict';

function Users(config, Around, Link) {
	this.config = config;
	this.Around = Around;
	this.Link = Link;
	this.getUser = getUser;
	this.createUser = createUser;
	this.updateUser = updateUser;
	this.deleteUser = deleteUser;
	this.parseUser = parseUser;
	this.reportUser = reportUser;
	this.getReportedUsers = getReportedUsers;
	this.parseUserForElasticSearch = parseUserForElasticSearch;
	this.getUsers = getUsers;
	this.getBlockedUsers = getBlockedUsers;
	this.blockUser = blockUser;
	this.unblockUser = unblockUser;
}

function createUsersController(config, Around, Link) {
	return new Users(config, Around, Link);
}

function getUsers(callback) {
	var config = this.config;
	config.redisLib.keys(config.usersKey+'*', function (err, keysUser) {
		var users = [];
		config.async.each(keysUser, function (key, callbackIt) {
			config.redisLib.getHash(key, function(err,response) {
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
						pictures: JSON.parse(response.pictures),
						location: JSON.parse(response.location)
					}
					users.push(user);
					callbackIt();
				} else {
					return callbackIt();
				}
			})

			
		}, function finish(err) {
			return callback(null, users);
		});
	})

}

function getUser(userId, callback) {
	var config = this.config;
	config.redisLib.getHash(config.usersKey+userId, function(err,response) {
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
				pictures: JSON.parse(response.pictures),
				location: JSON.parse(response.location)
			}
			return callback(null, user);
		} else {
			return callback(null, null);
		}
	})
}



function createUser(userId, user, Preferences, callback) {
	var Preferences = Preferences;
	var config = this.config;
	config.redisLib.exists(config.usersKey+userId, function(err, exists) {
		if (exists) {
			return callback(null, null);
		} else {
			config.redisLib.addToSet(config.genderKey+user.gender, userId, function (err, reply) {
				if (err) return callback (err, null);
				config.redisLib.addToSet(config.genderKey+config.bothKey, userId, function (err, reply) {
					if (err) return callback(err, null);
					config.redisLib.setHash(config.usersKey+userId, user, function (err, response) {
						if (err) return callback(err, null);
						var minAge = ((user.age -5) < 18) ? 18 : (user.age -5);
						var maxAge = parseInt(user.age) + 5;
						var defaultPreferences = {
							gender: 'both',
							distance: 10,
							minAge: minAge,
							maxAge: maxAge,
							mode: 'visible',
							searchMode: 'couple'
						}
						Preferences.createPreferences(userId, defaultPreferences, function (err, response) {
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
							
						})
					});

				});
			});

		}
	})
}


function updateUser(userId, userUpdate, callback) {
	var config = this.config;
	config.redisLib.getHash(config.usersKey+userId, function(error, user) {
		if (error) return callback (error, null);
		if (user) {
			updateFieldUser(config, user, userUpdate, function (err, response) {
				if (err) callback(err, null);
				return callback(null, response);
			})
		} else {
			return callback(null, null);
		}

	});
}

function deleteUser(userId, callbackDelete) {
	var config = this.config;
	config.async.waterfall([
	    function removeFromUser(callback) {
	    	config.redisLib.deleteKey(config.usersKey+userId, function(err, response) {
				if (err) return callbackDelete(err, null);
				callback(null);
			});
	    },
	    function removeFromPreferences(callback) {
	    	config.redisLib.deleteKey(config.preferencesKey+userId, function(err, response) {
				if (err) return callbackDelete(err, null);
				callback(null);
			});
	    },
	    function removeFromGender(callback) {
	    	config.redisLib.removeFromSet(config.genderKey+'male', userId, function(err, response) {
				if (err) return callbackDelete(err, null);
				config.redisLib.removeFromSet(config.genderKey+'female', userId, function(err, response) {
					if (err) return callbackDelete(err, null);
					config.redisLib.removeFromSet(config.genderKey+'both', userId, function(err, response) {
						if (err) return callbackDelete(err, null);
						return callback(null);
					});
				});
			
			});
	    },
	    function removeFromAround(callback) {
	    	config.redisLib.keys(config.aroundKey+'*', function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cb) {
					config.redisLib.deleteKey(key, function(err, response) {
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

function updateFieldUser(config, user, userUpdate, cbUpdate) {
	config.async.forEach(Object.keys(userUpdate), function (userField, callback){ 
	    if (userUpdate[userField] instanceof Array) {
	    	userUpdate[userField] = JSON.stringify(userUpdate[userField]);
	    }
	    config.redisLib.setHashField(config.usersKey+user.id,userField,userUpdate[userField], function (err, response) {
			if (err) return cbUpdate(err, null);
			callback();
		});

	}, function(err) {
		if (err) return cbUpdate(err, null);
	    return cbUpdate(null, "OK");
	});  
}

function parseUser(facebookUser, callbackUser) {
	var config = this.config;
	config.async.waterfall([
	    function parseCbLikes(callback) {
	    	if (facebookUser.likes ? true : false ) {
		    	parseLikes(config, facebookUser.likes.data, function (likes) {
		    		callback(null, likes);
		    	});
	    	} else {
	    		callback(null, []);
	    	}
	    },
	    function parseCbEducation(likes, callbackEducation) {
	    	if (facebookUser.education ? true : false ) {
		    	parseEducation(config, facebookUser.education, function(education) {
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

function reportUser(userId, userBody, callback) {
	var config = this.config;
	if (userBody.userId == undefined) {
		return callback(null, "Empty User Id");
	} else {
		var reportedUser = {
			userIdReporter: userId,
			userId: userBody.userId,
			reason: (userBody.reason != undefined) ? userBody.reason : ""
		}
		config.redisLib.addToSet(config.reportedKey, userBody.userId, function (err, response) {
			if (err) return callback(err, null);
			config.redisLib.setHash(config.reportedUserKey+userBody.userId+':'+userId, reportedUser, function (err, response) {
				if (err) return callback(err, null);
				return callback(null, true);
			})
		})
	}
}

function getReportedUsers(callback) {
	var config = this.config;
	config.redisLib.getFromSet(config.reportedKey, function(err, usersReportedIds) {
		var usersReported = [];
		config.async.each(usersReportedIds, function (userId, callbackIt) {

			config.redisLib.keys(config.reportedUserKey+userId+'*', function (err, keysUser) {
			var users = [];
			config.async.each(keysUser, function (key, cbIt) {
				config.redisLib.getHash(key, function(err, response) {
					if (err) return cbIt(err, null);
					var userReported = {
						userIdReporter: response.userIdReporter,
						userId: response.userId,
						reason: response.reason
					};
					usersReported.push(userReported);
					return cbIt();
				})
				
			}, function finish(err) {
				return callbackIt();
			});
		})

		}, function finish(err) {
			if (err) return callback(err, null);
			return callback(null, usersReported);
		});
	})
}


function blockUser(userId, userBody, callback) {
	//chequear q no aparezca en los around, en links, 
	var config = this.config;
	var Around = this.Around;
	var Link = this.Link;
	if (userBody.userId == undefined) {
		return callback(null, "Empty User Id");
	} else {
		config.redisLib.getHash(config.linkKey+userId+':'+userBody.userId, function (err, link)  {
			if (link) {
				config.redisLib.addToSet(config.blockedKey+userId, userBody.userId, function (err, response) {
					if (err) return callback(err, null);
					//block in around
					Around.blockAroundUser(userId, userBody.userId, function (err, response) {
						if (err) {
							return callback(err, null);
						}
						if (response) {
							//block in links
							Link.blockLink(userId, userBody.userId, function (err, response) {
								if (err) {
									return callback(err, null);
								}
								return callback(null, response);	
							})
						}
					})
				})
			} else {
				console.log("NO HAY LINK");
				return callback(null, "Users not linked");
			}	
		});
	}
}

function unblockUser(userId, userBody, callback) {
	//chequear q no aparezca en los around, en links, 
	var config = this.config;
	var Around = this.Around;
	var Link = this.Link;
	if (userBody.userId == undefined) {
		return callback(null, "Empty User Id");
	} else {
		config.redisLib.removeFromSet(config.blockedKey+userId, userBody.userId, function (err, response) {
			if (err) return callback(err, null);
			//block in around
			Around.unblockAroundUser(userId, userBody.userId, function (err, response) {
				if (err) {
					return callback(err, null);
				}
				if (response) {
					//block in links
					Link.unblockLink(userId, userBody.userId, function (err, response) {
						if (err) {
							return callback(err, null);
						}
						return callback(null, response);	
					})
				}
			})
		});
	}
}

function getBlockedUsers(userId, callback) {
	var config = this.config;
	config.redisLib.getFromSet(config.blockedKey+userId, function(err, usersBlockedIds) {
		var usersBlocked = [];
		config.async.each(usersBlockedIds, function (id, callbackIt) {
			config.redisLib.getHash(config.usersKey+id, function (err, user) {
				var blockedUser = {
					userId: id,
					name: user.name,
					description: user.description,
					picture: user.picture
				};
				usersBlocked.push(blockedUser);
				callbackIt();	
			})

		}, function finish(err) {
			if (err) return callback(err, null);
			return callback(null, usersBlocked);
		});
	})
}


function parseLikes(config, likes, callbackLikes) {
	var likesParsed = [];
	config.async.each(likes, function (like, callback) {
		var likeObj = {
			name: like.name
		};

		likesParsed.push(likeObj);
		callback();
	}, function finish(err) {
		return callbackLikes(likesParsed);
	});
}

function parseEducation(config, educations, cbEducation) {
	var educationParsed = [];
	config.async.each(educations, function (education, callback) {
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
	var config = this.config;
	config.redisLib.getHash(config.usersKey+userId, function(err, user) {
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
			config.ESLib.addToIndex('users', 'user', userId, userES, function(error, response) {
				return callback(null, response);
			})
		} else {
			return callback(null, null);
		}
	})
}

module.exports = {
	createUsersController: createUsersController,
	getUser: getUser,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser,
	parseUser: parseUser,
	reportUser: reportUser,
	getReportedUsers: getReportedUsers,
	parseUserForElasticSearch: parseUserForElasticSearch,
	getUsers: getUsers,
	blockUser: blockUser,
	getBlockedUsers: getBlockedUsers,
	unblockUser: unblockUser
}