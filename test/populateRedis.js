var UsersController 		= require('../controllers/User');
var PreferencesController 	= require('../controllers/Preferences');
var AroundController 		= require('../controllers/Around');
var LocationController 		= require('../controllers/Location');
var objects 				= require('./toTestObj');
var config 					= require('../config');

Users = UsersController.createUsersController(config);
Around = AroundController.createAroundController(config);	
Preferences = PreferencesController.createPreferencesController(config, Users, Around);
Location = LocationController.createLocationController(config);


var properties = {
	properties: {
		userId: {
			type: "string"
		},
		location: {
			type: "geo_point"
		},
		age: {
			type: "string"
		},
		gender: {
			type: "string"
		},
		mode: {
			type: "string"
		},
		searchMode: {
			type: "string"
		}

	}
}

config.ESLib.indexExists('users', function(err, res) {
	if (err) {
		console.log("Error checking if index exists");
		console.log(err);
	}
	if(res) {
		config.ESLib.initMapping('users', 'user', properties, function(err, res) {
			if (err) {
				console.log("err");
				console.log(err);
			}
			if (res) {
				//console.log(res);
			}
		});
	} else {
		config.ESLib.createIndex('users', function(err, res) {
			if (err) {
				console.log("err creating index");
				console.log(err);
			} 
			if (res) {
				config.ESLib.initMapping('users', 'user', properties, function(err, res) {
					if (err) {
						console.log("err init mapping");
						console.log(err);
					}
					console.log("response init mapping");
					console.log(res);
				});
			}
		});
	}
})
	
config.async.waterfall([
	    function (callback) {
	    	Users.parseUser(objects.user, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationOne, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userOnePreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");
												callback(null);
											})
										}
									})
								}
							})
						} else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.maleUserTwo, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationOne, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userTwoPreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})

	    },
	    function (callback) {
	    	Users.parseUser(objects.maleUserThree, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationFour, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userThreePreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
			Users.parseUser(objects.maleUserFour, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationTwo, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userSevenPreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.femaleUser, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationOne, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userFourPreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.femaleUserTwo, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationOne, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userFivePreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.femaleUserThree, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationOne, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userSixPreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.femaleUserFour, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationFour, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userEightPreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.maleUserFive, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationThree, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userMaleFivePreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    },
	    function (callback) {
	    	Users.parseUser(objects.femaleUserFive, function (userParsed) {
				if (userParsed) {
					Users.createUser(userParsed.id, userParsed, Preferences, function (err, response) {
					console.log("========");
						if (response) {
							Location.updateLocation(userParsed.id, objects.locationThree, function (err, response) {
								if (response) {
									Preferences.parsePreferences(userParsed.id, objects.userNinePreferences, function (err, prefParsed) {
										if (prefParsed) {
											Preferences.createPreferences(userParsed.id, prefParsed, function (err, response) {
												console.log("user created");	
												callback(null);
											})
										}
									})
								}
							})
						}  else {
							return callback(null);
						}
					})
				} else {
					console.log("ERROR PARSED");
				}
			})
	    }
	], function (error) {
	    if (error) {
	    	return console.log(error);
	    }
	    process.exit();
	});


