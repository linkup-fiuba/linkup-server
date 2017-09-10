var Users 		= require('./controllers/User');
var Preferences = require('./controllers/Preferences');
var redisLib 	= require('./redisLib'); //testing


// ROUTES FOR OUR API
// =============================================================================


function create(router) {
	// middleware to use for all requests
	router.use(function(req, res, next) {
	    // do logging
	    console.log(req.method+' '+req.url);
	    next(); // make sure we go to the next routes and don't stop here
	});
	router = createUserRoutes(router);
	router = createUserPreferencesRoutes(router);
	return router;
}

function createUserRoutes(router) {
	router.route('/users/:user_id')
	    .get(function(req, res) {
	    	Users.getUser(req.params.user_id, function(err,response) {
	    		if (err) {
	    			res.json({
						statusCode: 500,
						data: err
					});	
	    		}
	    		if (!response) {
	    			res.json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});	
	    		}
	    		response.education = JSON.parse(response.education);
	    		response.likes = JSON.parse(response.likes);
				res.json({
					statusCode: 200,
					data: response
				}); 
	    	})
	    })
	    .put(function(req, res) {
	    	Users.updateUser(req.params.user_id, req.body, function (err, response) {
	    		if (err) {
	    			res.json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!response) {
	    			res.json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	res.json({
						statusCode: 200,
						data: response
					});
	    		}
	    	});
	    }) 
	    .delete(function(req, res) {
	    	Users.deleteUser(req.params.user_id, function(err,response) {
	    		if (err) {
		    		res.json({
						statusCode: 500,
					 	data: err
					});	
	    		}

	    		if (!response) {
	    			res.json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
	    			res.json({
						statusCode: 200,
						data: "OK"
					}); 
	    		}
	    	})
	    });

	router.route('/users')
		.post(function(req,res) {
			Users.parseUser(req.body, function(userModel) {
				Users.createUser(userModel.id, userModel, function(err, response) {
					if (err) {
						res.json({
							statusCode: 500,
							data: err
						});
					}
					if (!response) {
						res.json({
							statusCode: 404,
							data: "User already exists"
						});	
					} else {
				    	res.json({
							statusCode: 200,
							data: response
						});
					}
				});
				
			})
		})

	router.route('/test')
		.get(function(req,res) {
			redisLib.exists("user_101526692901751231", function(error, reply) {
				if (reply) {
					res.json({
						statusCode: 200,
						data: reply
					})
				} else {
					res.json({
						statusCode: 500,
						data: "error"
					})
				}
			});
		});
	return router;
}

function createUserPreferencesRoutes(router) {
	router.route('/users/:user_id/preferences')
		.post(function (req, res) {
			Preferences.parsePreferences(req.params.user_id, req.body, function(errorParse, preferencesModel) {
				if (errorParse) {
					res.json({
						statusCode: 500,
						data: errorParse
					});
				} else {
					Preferences.createPreferences(req.params.user_id, preferencesModel, function (err, response) {
						if (err) {
							res.json({
								statusCode: 500,
								data: err
							});
						}
						//si ya existe lo reemplaza con el nuevo set de preferencias
				    	res.json({
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
	    			res.json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!reply) {
	    			res.json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	res.json({
						statusCode: 200,
						data: reply
					});
	    		}
			});
		})
		.put(function (req, res) {
			Preferences.updatePreferences(req.params.user_id, req.body, function (err, reply) {
				if (err) {
	    			res.json({
	    				statusCode: 500,
	    				data: err
	    			});
	    		}

	    		if (!reply) {
	    			res.json({
						statusCode: 404,
						data: "User "+req.params.user_id+" not found"
					});
	    		} else {
			    	res.json({
						statusCode: 200,
						data: reply
					});
	    		}
	    	})
		})
	return router;
}

module.exports = {
	create: create
};