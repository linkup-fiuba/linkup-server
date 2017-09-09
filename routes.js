var Users = require('./controllers/User');
var redisLib = require('./redisLib'); //testing


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
			    	res.json({
						statusCode: 200,
						data: response
					});
					
				});
				
			})
		})

	router.route('/test')
		.get(function(req,res) {
			redisLib.get("test", function(error, reply) {
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

module.exports = {
	create: create
};