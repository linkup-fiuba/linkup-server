'use strict';

var UsersController 		= require('./controllers/User');
var PreferencesController 	= require('./controllers/Preferences');
var AroundController 		= require('./controllers/Around');
var LocationController 		= require('./controllers/Location');
var ConfigurationController = require('./controllers/Configuration');
var LinkController 			= require('./controllers/Link');
var LikesController			= require('./controllers/Likes');


// ROUTES FOR OUR API
// =============================================================================


function create(router, config) {
	this.config = config;
	this.Around = AroundController.createAroundController(this.config);	
	this.Link = LinkController.createLinkController(this.config);
	this.Location = LocationController.createLocationController(this.config);
	this.Configuration = ConfigurationController.createConfigurationController(this.config);
	this.Users = UsersController.createUsersController(this.config, this.Around, this.Link);
	this.Preferences = PreferencesController.createPreferencesController(this.config, this.Users, this.Around);
	this.Likes = LikesController.createLikesController(this.config, this.Link);
	// middleware to use for all requests
	router.use(function(req, res, next) {
	    // do logging
	    console.log(req.method+' '+req.url);
	    next(); // make sure we go to the next routes and don't stop here
	});

	router.route('/')
		.get(function(req,res) {
			res.status(200).json({
				statusCode: 200,
				data: "Welcome to linkup API"
			});	
		});
	router = createUserRoutes(this.Users, this.Preferences, router);
	router = createUserPreferencesRoutes(this.Preferences, router);
	router = createUserAroundRoutes(this.Around, router);
	router = createUserLocationRoutes(this.Location, router);
	router = createConfigurationRoutes(this.Configuration, router);
	router = createLikesRoutes(this.Likes, router);
	router = createLinkRoutes(this.Link, router);
	router = createReportedRoutes(this.Users, config, router);
	router = createUserDisabled(this.Users, router);
	router = createBlockedRoutes(this.Users, router);
	return router;
}

function createUserRoutes(Users, Preferences, router) {
	router.route('/users/:user_id')
	    .get(function(req, res) {
	    	Users.getUser(req.params.user_id, function(err,response) {
	    		if (err) {
	    			return res.status(500).json({
						statusCode: 500,
						data: err
					});	
	    		}
	    		if (!response) {
	    			return res.status(404).json({
						status: 404,
						data: "User "+req.params.user_id+" not found"
					});	
	    		}
				return res.json({
					statusCode: 200,
					data: response
				}); 
	    	})
	    })
	    .put(function(req, res) {
	    	Users.updateUser(req.params.user_id, req.body, function (err, response) {
	    		if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!response) {
	    			return res.status(404).json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	return res.json({
						statusCode: 200,
						data: response
					});
	    		}
	    	});
	    }) 
	    .delete(function(req, res) {
	    	Users.deleteUser(req.params.user_id, function(err,response) {
	    		if (err) {
		    		return res.status(500).json({
						statusCode: 500,
					 	data: err
					});	
	    		}

	    		if (!response) {
	    			return res.status(404).json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
	    			return res.json({
						statusCode: 200,
						data: "OK"
					}); 
	    		}
	    	})
	    });

	router.route('/users')
		.post(function(req,res) {
			Users.parseUser(req.body, function(userModel) {
				Users.createUser(userModel.id, userModel,  Preferences, function(err, response) {
					if (err) {
						return res.status(500).json({
							statusCode: 500,
							data: err
						});
					}
					if (!response) {
						return res.status(404).json({
							statusCode: 404,
							data: "User "+userModel.id+ " already exists"
						});	
					} else {
				    	return res.status(200).json({
							statusCode: 200,
							data: response
						});
					}
				});
				
			})
		})
		.get(function (err, res) {
			Users.getUsers(function (err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				var items = response.length;
				var header = '0-'+(items-1)+'/'+items;
				res.setHeader('Content-Range', 'items '+header);
				return res.status(200).json({
							statusCode: 200,
							data: response
						});
			})
		});

		
	return router;
}

/**
Reportar un usuario POST /users/:user_id/report {userIdReporter, reason}
Eliminar reportes de un usuario DELETE /users/:user_id/report
Eliminar un reporte especifico de un usuario DELETE /users/:user_id/report/:user_id_reporter
Obtener todos los reportes de un usuario GET /users/:user_id/report
Obtener todos los usuarios reportados GET /reported
**/
function createReportedRoutes(Users, config, router) {
	router.route('/users/:user_id/report')
		.post(function(req,res) {
			Users.reportUser(req.params.user_id, req.body, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})
		.delete(function(req, res) {
			// delete all reports of user :user_id
			Users.deleteReports(config, req.params.user_id, function (err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})
		.get(function (req, res) {
			Users.getReports(req.params.user_id, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
					var items = response.length;
					var header = '0-'+(items-1)+'/'+items;
					res.setHeader('Content-Range', 'items '+header);
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})


	router.route('/reports')
		.get(function(req,res) {
			Users.getReportedUsers(function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
					var items = response.length;
					var header = '0-'+(items-1)+'/'+items;
					res.setHeader('Content-Range', 'items '+header);
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})
	router.route('/reports/:report_id')
		.get(function(req,res) {
			Users.getReport(req.params.report_id, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})
		.delete(function(req,res) {
			Users.deleteReport(req.params.report_id, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})
	return router;
}


function createUserDisabled(Users, router) {
	router.route('/users/:user_id/disable')
		.post(function (req, res) {
			//disable user
			Users.disableUser(req.params.user_id, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (response != "OK") {
					return res.status(404).json({
						statusCode: 404,
						data: response
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			})
		})
	/*router.route('/users/:user_id/enable')
		.post(function (req, res) {
			//enable user
		})*/
	return router;
}


function createUserPreferencesRoutes(Preferences, router) {
	router.route('/users/:user_id/preferences')
		.post(function (req, res) {
			Preferences.parsePreferences(req.params.user_id, req.body, function(errorParse, preferencesModel) {
				if (errorParse) {
					return res.status(500).json({
						statusCode: 500,
						data: errorParse
					});
				} else {
					Preferences.createPreferences(req.params.user_id, preferencesModel, function (err, response) {
						if (err) {
							return res.status(500).json({
								statusCode: 500,
								data: err
							});
						}
						//si ya existe lo reemplaza con el nuevo set de preferencias
				    	return res.json({
							statusCode: 200,
							data: response
						});
					});
				}
			})
		})
		.get(function (req, res) {
			Preferences.getPreferences(req.params.user_id, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!reply) {
	    			return res.status(404).json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	return res.json({
						statusCode: 200,
						data: reply
					});
	    		}
			});
		})
		.put(function (req, res) {
			Preferences.updatePreferences(req.params.user_id, req.body, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!reply) {
	    			return res.status(404).json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	return res.json({
						statusCode: 200,
						data: reply
					});
	    		}
	    	})
		})
	return router;
}

function createUserAroundRoutes(Around, router) {
	router.route('/users/:user_id/around')
		.get(function (req, res) {
			Around.getAroundUsers(req.params.user_id, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!reply) {
	    			return res.status(404).json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	return res.json({
						statusCode: 200,
						data: reply
					});
	    		}
			});
		});
	router.route('/users/:user_id/around/:user_id_remove')
		.delete(function (req, res) {
			Around.deleteAroundUser(req.params.user_id, req.params.user_id_remove, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: "OK"
				});
	    		
	    	})
		})
		
	return router;
}

function createConfigurationRoutes(Configuration, router) {
	router.route('/config')
		.post(function (req, res) {
			Configuration.setConfig(req.body, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
			});
		})
		.get(function (req, res) {
			Configuration.getConfig(function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
	    	})
		})
		.put(function (req, res) {
			Configuration.updateConfig(req.body, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
			})
		})
		
	return router;
}

function createUserLocationRoutes(Location, router) {
	router.route('/users/:user_id/location')
		.post(function (req, res) {
			Location.createLocation(req.params.user_id, req.body, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
			});
		})
		.get(function (req, res) {
			Location.getLocation(req.params.user_id, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
	    	})
		})
		.put(function (req, res) {
			Location.updateLocation(req.params.user_id, req.body, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
			})
		})
		
	return router;
}


function createLikesRoutes(Likes, router) {
	router.route('/users/:user_id/likes')
		.post(function (req, res) {
			Likes.setLike(req.params.user_id, req.body.userId, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
			});
		})
		.get(function (req, res) {
			Likes.getLikes(req.params.user_id, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
	    	})
		});
	router.route('/users/:user_id/likes/:remove_id')
		.delete(function (req, res) {
			Likes.removeLike(req.params.user_id, req.params.remove_id, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
			})
		})

	router.route('/users/:user_id/superlike')
	.post(function (req, res) {
		Likes.setSuperLike(req.params.user_id, req.body.userId, function (err, reply) {
			if (err) {
    			return res.status(500).json({
    				statusCode: 500,
    				data: err
    			});
    		}
    		
	    	return res.json({
				statusCode: 200,
				data: reply
			});
    		
		});
	})
		
	return router;
}

function createLinkRoutes(Link, router) {
	router.route('/users/:user_id/links')
		.get(function (req, res) {
			Link.getLinks(req.params.user_id, function (err, reply) {
				if (err) {
	    			return res.status(500).json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}
	    		
		    	return res.json({
					statusCode: 200,
					data: reply
				});
	    		
			});
		});
	return router;
}


function createBlockedRoutes(Users, router) {
	router.route('/users/:user_id/block')
		.post(function(req,res) {
			Users.blockUser(req.params.user_id, req.body, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})

	router.route('/users/:user_id/unblock')
		.post(function(req,res) {
			Users.unblockUser(req.params.user_id, req.body, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})	

	router.route('/users/:user_id/block')
		.get(function(req,res) {
			Users.getBlockedUsers(req.params.user_id, function(err, response) {
				if (err) {
					return res.status(500).json({
						statusCode: 500,
						data: err
					});
				}
				if (!response) {
					return res.status(404).json({
						statusCode: 404,
						data: "Error"
					});	
				} else {
			    	return res.status(200).json({
						statusCode: 200,
						data: response
					});
				}
			});
		})
	return router;
}


module.exports = {
	create: create
};