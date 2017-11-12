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
	this.getReport = getReport;
	this.deleteReport = deleteReport;
	this.deleteReports = deleteReports;
	this.closeReport = closeReport;
	this.closeReports = closeReports;
	this.getReports = getReports;
	this.getReportedUsers = getReportedUsers;
	this.getUsersReport = getUsersReport;
	this.parseUserForElasticSearch = parseUserForElasticSearch;
	this.getUsers = getUsers;
	this.getBlockedUsers = getBlockedUsers;
	this.blockUser = blockUser;
	this.unblockUser = unblockUser;
	this.enableUser = enableUser;
	this.disableUser = disableUser;
	this.createPremium = createPremium;
	this.deletePremium = deletePremium;
}

function createUsersController(config, Around, Link) {
	return new Users(config, Around, Link);
}

function getUsers(queryParams, callback) {
	var config = this.config;
		var filter = undefined;
	if (Object.keys(queryParams).length != 0) {
		filter = JSON.parse(queryParams.filter); 
		if (filter != undefined && filter.id != undefined) {
			var users = [];
			config.async.each(filter.id, function (id, callbackIt) {
				getUser(config, id, function(err, response) {
					if (response) {
						users.push(response);
						return callbackIt();
					} else {
						return callbackIt();
					}
				})	
			}, function finish(err) {
				return callback(null, users);
			});
			
		} else {
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
								location: JSON.parse(response.location),
								disable: (response.disable != undefined) ? response.disable : false,
								premium: (response.premium != undefined) ? response.premium : false ,
								createdAt: (response.createdAt != undefined) ? response.createdAt : null 
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
	} else {
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
							likes: (response.likes != undefined) ? JSON.parse(response.likes) : [],
							gender: response.gender,
							education: (response.education) ? JSON.parse(response.education) : [],
							description: response.description,
							pictures: (response.pictures) ? JSON.parse(response.pictures) : [],
							location: (response.location) ? JSON.parse(response.location) : [],
							disable: (response.disable != undefined) ? response.disable : false,
							premium: (response.premium != undefined) ? response.premium : false ,
							createdAt: (response.createdAt != undefined) ? response.createdAt : null
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

}

function getUser(config, userId, callback) {
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
				location: JSON.parse(response.location),
				disable: (response.disable != undefined) ? (response.disable) : false,
				premium: (response.premium != undefined) ? response.premium : false ,
				createdAt: (response.createdAt != undefined) ? response.createdAt : null 
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
							config.redisLib.set(config.maxLikesKey+userId, config.maxLikesCommon, function (err, res) {
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
									pictures: JSON.parse(user.pictures),
									disable: user.disable,
									premium: user.premium,
									createdAt: user.createdAt
								}

								return callback(null, userModel);
							})

							
							
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
	    if (userUpdate[userField] instanceof Array || userUpdate[userField] instanceof Object) {
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
			pictures: JSON.stringify([]),
			disable: false,
			premium: false,
			createdAt: Date.now()
		}
		
	    return callbackUser(user);
	});
}

function reportUser(userId, userBody, callback) {
	var config = this.config;
	if (userBody.userIdReporter == undefined) {
		return callback(null, "Empty User Id");
	} else {
		if (config.reportOptions.contains(userBody.reason)) {
			var reportedUser = {
				id: config.uuidv1(),
				date: Date.now(),
				userIdReporter: userBody.userIdReporter,
				userId: userId,
				type: userBody.reason,
				reason: (userBody.reason != undefined) ? userBody.reason : "default",
				status: "open"
			}			
		} else {
			var reportedUser = {
				id: config.uuidv1(),
				date: Date.now(),
				userIdReporter: userBody.userIdReporter,
				userId: userId,
				type: "Otro",
				reason: (userBody.reason != undefined) ? userBody.reason : "default",
				status: "open"
			}
		}

		config.redisLib.addToSet(config.reportedKey, userId, function (err, response) {
			if (err) return callback(err, null);
			config.redisLib.keys(config.reportedUserKey+userId+':'+userBody.userIdReporter+'*', function (err, response) {
				if (!response || response.length == 0) {
					config.redisLib.setHash(config.reportedUserKey+userId+':'+userBody.userIdReporter+'_'+reportedUser.id, reportedUser, function (err, response) {
						if (err) return callback(err, null);
						return callback(null, reportedUser);
					})
				} else {
					return callback(null, "El usuario ya fue reportado");
				}
			} )

		})
	}
}

function getReport(reportId, callback) {
	var config = this.config;
	config.redisLib.keys(config.reportedUserKey+'*'+reportId, function (err, response) {
		if (!response || response.length == 0) {
			return callback(null, []);
		} else {
			config.redisLib.getHash(response[0], function(err, reportResponse) {
				if (err) return callback(err, null);
				var report = {
					id: reportResponse.id,
					date: reportResponse.date,
					userIdReporter: reportResponse.userIdReporter,
					userId: reportResponse.userId,
					type: reportResponse.type,
					reason: reportResponse.reason,
					status: (reportResponse.status != undefined) ? reportResponse.status : 'open'
				};
				return callback(null, report);
			})
		}
	} )

}

function closeReport(reportId, callback) {
	var config = this.config;
	config.redisLib.keys(config.reportedUserKey+'*'+reportId, function (err, response) {
		if (!response || response.length == 0) {
			return callback(null, []);
		} else {
			config.redisLib.setHashField(response[0], 'status', 'closed', function(err, reportResponse) {
				if (err) return callback(err, null);
				return callback(null, true);
			})
		}
	} )
}

function deleteReport(reportId, callback) {
	var config = this.config;
	config.redisLib.keys(config.reportedUserKey+'*'+reportId, function (err, response) {
		if (!response || response.length == 0) {
			return callback(null, []);
		} else {
			config.redisLib.deleteKey(response[0], function(err, reportResponse) {
				if (err) return callback(err, null);
				return callback(null, true);
			})
		}
	} )
}

function deleteReports(config, userId, callback) {
	config.redisLib.removeFromSet(config.reportedKey, userId, function (err, response) {
		if (err) return callback(err, null);
		config.redisLib.keys(config.reportedUserKey+userId+'*', function (err, keysUser) {
			config.async.each(keysUser, function (key, cbIt) {
				config.redisLib.deleteKey(key, function(err, response) {
					if (err) return cbIt(err, null);
					return cbIt();
				})
			}, function finish(err) {
				if (err) return callback(err, null);
				return callback(null, true);
			});
		})
	})

}

function closeReports(config, userId, callback) {
	config.redisLib.removeFromSet(config.reportedKey, userId, function (err, response) {
		if (err) return callback(err, null);
		config.redisLib.keys(config.reportedUserKey+userId+'*', function (err, keysUser) {
			config.async.each(keysUser, function (key, cbIt) {
				config.redisLib.setHashField(key, 'status', 'closed', function(err, response) {
					if (err) return cbIt(err, null);
					return cbIt();
				})
			}, function finish(err) {
				if (err) return callback(err, null);
				return callback(null, true);
			});
		})
	})

}

function getReports(config, userId, callback) {
	config.redisLib.keys(config.reportedUserKey+userId+'*', function (err, keysUser) {
		if (err) return callback(err, null);
		var reports = [];
		config.async.each(keysUser, function (key, cbIt) {
			config.redisLib.getHash(key, function(err, response) {
				if (err) return cbIt(err, null);
				var userReported = {
					id: response.id,
					date: response.date,
					userIdReporter: response.userIdReporter,
					userId: response.userId,
					type: response.type,
					reason: response.reason,
					status: (response.status != undefined) ? response.status : 'open'
				};
				reports.push(userReported);
				return cbIt();
			})
			
		}, function finish(err) {
			if (err) return callback(err, null);
			return callback(null, reports);
		});
	})	

}

function getReportedUsers(queryParams, callback) {
	var config = this.config;
	var filter = undefined;
	if (Object.keys(queryParams).length != 0) {
		filter = JSON.parse(queryParams.filter); 
		if (filter != undefined && filter.userId != undefined) {
			getReports(config, filter.userId, function(err, response) {
				if (response) {
					return callback(null, response);
				} else {
					return callback(null, []);
				}
			})
		} else {
			config.redisLib.getFromSet(config.reportedKey, function(err, usersReportedIds) {
				var usersReported = [];
				config.async.each(usersReportedIds, function (userId, callbackIt) {
					config.redisLib.keys(config.reportedUserKey+userId+'*', function (err, keysUser) {
						var users = [];
						config.async.each(keysUser, function (key, cbIt) {
							config.redisLib.getHash(key, function(err, response) {
								if (err) return cbIt(err, null);
								var userReported = {
									id: response.id,
									date: response.date,
									userIdReporter: response.userIdReporter,
									userId: response.userId,
									type: response.type,
									reason: response.reason,
									status: (response.status != undefined) ? response.status : 'open'
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
		var userId = null;
	} else {
		config.redisLib.getFromSet(config.reportedKey, function(err, usersReportedIds) {
			var usersReported = [];
			config.async.each(usersReportedIds, function (userId, callbackIt) {
				config.redisLib.keys(config.reportedUserKey+userId+'*', function (err, keysUser) {
					var users = [];
					config.async.each(keysUser, function (key, cbIt) {
						config.redisLib.getHash(key, function(err, response) {
							if (err) return cbIt(err, null);
							var userReported = {
								id: response.id,
								date: response.date,
								userIdReporter: response.userIdReporter,
								userId: response.userId,
								type: response.type,
								reason: response.reason,
								status: (response.status != undefined) ? response.status : 'open'
							};
							usersReported.push(userReported);
							return cbIt();
						})
						
					}, function finish(err) {
						return callbackIt();
					});
				})

			}, function finish(err) {
				if (err) return calcrealback(err, null);
				return callback(null, usersReported);
			});
		})

	}
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

function disableUser(userId, callback) {
	//eliminar d los around de todos, eliminar los reports
	// agregar field en user que indique enable: true/false
	var config = this.config;
	config.async.waterfall([
		function checkDisabled(cb) {
			config.redisLib.getHashField(config.usersKey+userId, 'disable', function(err, res) {
				if (res == true || res == "true") {
					return callback(null, "Usuario bloqueado previamente");
				} else {
					return cb();
				}
			});
		},	
	    function removeFromAround(cb) {
	    	config.redisLib.deleteKey(config.aroundKey+userId, function(err, response) {
				if (err) return cb(err, null);
				return cb(null);
			});
	    },
	    function removeFromAround(cb) {
	    	config.redisLib.keys(config.aroundKey+userId+'*', function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cbIt) {
					config.redisLib.deleteKey(key, function(err, response) {
						if (err) return cbIt(err, null);
						return cbIt();
					});
				}, function finish(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
	    	});
	    },
	    function removeFromAround(cb) {
	    	config.redisLib.keys(config.aroundKey+'*'+userId, function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cbIt) {
					config.redisLib.deleteKey(key, function(err, response) {
						if (err) return cbIt(err, null);
						return cbIt();
					});
				}, function finish(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
	    	});
	    },
	    function disableLink(cb) {
	    	config.redisLib.keys(config.linkKey+'*'+userId, function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cbIt) {
					config.redisLib.setHashField(key, "disable", true, function(err, response) {
						if (err) return cbIt(err, null);
						return cbIt();
					});
				}, function finish(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
	    	});
	    },
	    function disableLink(cb) {
	    	config.redisLib.keys(config.linkKey+userId+'*', function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cbIt) {
					config.redisLib.setHashField(key, "disable", true, function(err, response) {
						if (err) return cbIt(err, null);
						return cbIt();
					});
				}, function finish(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
	    	});
	    },
	    function updateStatus(cb) {
	    	config.redisLib.setHashField(config.usersKey+userId, "disable", true, function (err, response) {
				if (err) return cb(err, null);
				return cb(null);
			});
	    },
	    function deleteReportsOfUser(cb) {
	    	deleteReports(config, userId, function (err, response) {
	    		if (err) return cb(err, null);
	    		return cb(null);
	    	})
	    },
	], function (error) {
	    if (error) {
	    	return callback(error, null);
	    }
	    return callback(null, "OK");
	});
}

function enableUser(userId, callback) {
	var config = this.config;
	config.async.waterfall([
	    function enableLink(cb) {
	    	config.redisLib.keys(config.linkKey+'*'+userId, function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cbIt) {
					config.redisLib.setHashField(key, "disable", false, function(err, response) {
						if (err) return cbIt(err, null);
						return cbIt();
					});
				}, function finish(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
	    	});
	    },
	    function enableLink(cb) {
	    	config.redisLib.keys(config.linkKey+userId+'*', function(err, aroundKeyIds) {
	    		config.async.each(aroundKeyIds, function (key, cbIt) {
					config.redisLib.setHashField(key, "disable", false, function(err, response) {
						if (err) return cbIt(err, null);
						return cbIt();
					});
				}, function finish(err) {
					if (err) return cb(err, null);
					return cb(null);
				});
	    	});
	    },
	    function updateStatus(cb) {
	    	config.redisLib.setHashField(config.usersKey+userId, "disable", false, function (err, response) {
				if (err) return cb(err, null);
				return cb(null);
			});
	    }
	], function (error) {
	    if (error) {
	    	return callback(error, null);
	    }
	    return callback(null, "OK");
	});
}

function getUsersReport(queryParams, callback) {
	var config = this.config;
	var dateFrom = undefined;
	var dateTo = undefined;
	var filter = undefined;
	//tenemos filtro por fechas
	if (Object.keys(queryParams).length != 0) {
		config.async.waterfall([
		    function parseParams(cb) {
		    	filter = JSON.parse(queryParams.filter); 
				if (filter != undefined && filter.dateFrom != undefined) {
					dateFrom = filter.dateFrom;
				} else {
					//01/01/2000
					dateFrom = 946684800;
				}
				if (filter != undefined && filter.dateTo != undefined) {
					dateTo = filter.dateTo;
				} else {
					dateTo = Date.now()
				}
				return cb(null, dateFrom, dateTo);
		    },
		    function getByDate(dateFrom, dateTo, cb) {
		    	getUsersReportsByDate(config, dateFrom, dateTo, function (err, response) {
					if (err) return cb(err, null);
					return cb(null, response);
				})
		    }
		], function (error, response) {
		    if (error) {
		    	return callback(error, null);
		    }
		    return callback(null, response);
		});



	} else {
		//sin filtro por fechas
		// 01/01/2000
		getUsersReportsByDate(config, 946684800, Date.now(), function (err, response) {
			if (err) return callback(err, null);
			return callback(null, response);
		})

	}
}

function getUsersReportsByDate(config, dateFrom, dateTo, callback) {
	//users premium and common
	var results = [];
	console.log("FROM");
	console.log(new Date(dateFrom));
	console.log("TO");
	console.log(new Date(dateTo));

	var users = [];
	config.redisLib.keys(config.usersKey+'*', function (err, keysUser) {
		config.async.each(keysUser, function (key, callbackIt) {
			config.redisLib.getHash(key, function(err,response) {
				if (err) return callback(err, null);
				if (response) {
					var user = {
						id: response.id,
						premium: (response.premium != undefined) ? response.premium : false ,
						createdAt: (response.createdAt != undefined) ? response.createdAt : null					}
					users.push(user);
					callbackIt();
				} else {
					return callbackIt();
				}
			})

			
		}, function finish(err) {
			var results = [];
			var countUsers = users.length;
			var groupedUsers = config.groupByTime(users, 'createdAt', 'day');
			config.async.forEach(Object.keys(groupedUsers), function (day, cbItOne) {
				var commonUsers = 0;
				var premiumUsers = 0;
				if (day > dateFrom && day < dateTo) {
					config.async.forEach(groupedUsers[day], function (user, cbItTwo) {
						if (user.premium == "true") {
							if (user.createdAt > dateFrom && user.createdAt < dateTo) {
								premiumUsers++;
								return cbItTwo();
							} else {
								return cbItTwo();
							}
						} else if (user.createdAt > dateFrom && user.createdAt < dateTo){
							commonUsers++;
							return cbItTwo();
						} else {
							return cbItTwo();
						}
						
					}, function finish(err) {
						var byDay = {
							id: day,
							date: day,
							commonUsers: commonUsers,
							premiumUsers: premiumUsers
						}
						console.log("DAY");
						console.log(new Date(parseInt(day)));
						console.log(byDay);
						results.push(byDay);
						return cbItOne();
						
					});
				} else {
					return cbItOne();
				}
			}, function finish(err) {
				
				results = results.sort(config.helpers.compareByDateASC);
				results['totalUsers'] = countUsers;
				return callback(null, results);
				
			});
		});
	})

}




function groupUsersByDate(users, callback) {
	var byDay = {};
	var groupDay = function (value, index, array)
	{
	    var d = new Date(parseInt(value['createdAt']));
	    console.log("date by day");
		console.log(value['createdAt']);
	    console.log(d);
	    d = Math.floor(d.getTime()/(1000*60*60*24));
	    byDay[d]=byDay[d]||[];
	    byDay[d].push(value);
	}

	users.map(groupDay);
	//console.log("ORDENADOS");
	//console.log(byDay);
	//console.log(byDayPremium);
	
	return callback(null, byDay);
}



function createPremium(userBody, callback) {
	var config = this.config;
	var maxLikes = (config.maxLikesPremium != undefined) ? config.maxLikesPremium : config.maxLikesCommon
	if (userBody.userId == undefined) {
		return callback(null, "Empty User Id");
	} else {
		config.async.waterfall([
			function setMaxLikes(cb) {
				config.redisLib.set(config.maxLikesKey+userBody.userId, maxLikes, function (err, res) {
					if (err) return cb(err);
					return cb(null);
				})
			},
			function updateUser(cb) {
				config.redisLib.setHashField(config.usersKey+userBody.userId, 'premium', true, function (err, response) {
					if (err) return cb(err);
					return cb(null);
				})
			},
			function updateDate(cb) {
				config.redisLib.getHashField(config.usersKey+userBody.userId, 'createdAt', function (err, createdAt) {
					if (err) return cb(err);
					config.redisLib.setHashField(config.usersKey+userBody.userId, 'createdAt', Date.now(), function (err, response) {
						if (err) return cb(err);
						config.redisLib.setHashField(config.usersKey+userBody.userId, 'dateCreation', createdAt, function (err, response) {
							if (err) return cb(err);
							return cb(null);
						})
					})
				})
				
			},
			function addToPremiumList(cb) {
				config.redisLib.addToSet(config.premiumKey, userBody.userId, function (err, response) {
					if (err) return cb(err);
					return cb(null);
				})
			}

	], function (error) {
	    if (error) {
	    	return callback(error, null);
	    }
	    return callback(null, "OK");
	});
		
	}

}


function deletePremium(userId, callback) {
	var config = this.config;
	config.async.waterfall([
		function setMaxLikes(cb) {
			config.redisLib.set(config.maxLikesKey+userId, config.maxLikesCommon, function (err, res) {
				if (err) return cb(err);
				return cb(null);
			})
		},
		function updateUser(cb) {
			config.redisLib.setHashField(config.usersKey+userId, 'premium', false, function (err, response) {
				if (err) return cb(err);
				return cb(null);
			})
		},
		function updateDate(cb) {
			config.redisLib.getHashField(config.usersKey+userId, 'dateCreation', function (err, createdAt) {
				if (err) return cb(err);
				config.redisLib.setHashField(config.usersKey+userId, 'createdAt', createdAt, function (err, response) {
					if (err) return cb(err);
					return cb(null);
				})
			})
			
		},
		function addToPremiumList(cb) {
			config.redisLib.removeFromSet(config.premiumKey, userId, function (err, response) {
				if (err) return cb(err);
				return cb(null);
			})
		}

	], function (error) {
	    if (error) {
	    	return callback(error, null);
	    }
	    return callback(null, "OK");
	});
		
	

}


Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

module.exports = {
	createUsersController: createUsersController,
	getUser: getUser,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser,
	createPremium: createPremium,
	deletePremium: deletePremium,
	parseUser: parseUser,
	reportUser: reportUser,
	getReport: getReport,
	deleteReport: deleteReport,
	deleteReports: deleteReports,
	getReports: getReports,
	getReportedUsers: getReportedUsers,
	closeReport: closeReport,
	closeReports: closeReports,
	getUsersReport: getUsersReport,
	parseUserForElasticSearch: parseUserForElasticSearch,
	getUsers: getUsers,
	blockUser: blockUser,
	getBlockedUsers: getBlockedUsers,
	unblockUser: unblockUser,
	enableUser: enableUser,
	disableUser: disableUser
}