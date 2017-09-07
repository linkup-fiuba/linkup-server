var Users = require('./User');


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
	router = createImagesRoutes(router);
	return router;
}

function createUserRoutes(router) {
	router.route('/users/:user_id')
	    .get(function(req, res) {
	    	Users.getUser(req.params.user_id, function(err,response) {
	    		console.log("WTF");
	    		console.log(response);
				res.json({
					statusCode: 200,
					data: response
				}); 
	    	})
	    })
	    .put(function(req,res) {
	    	console.log("update user");
	    	res.json({
				statusCode: 200,
				data: "update"
			});
	    }) 
	    .delete(function(req,res) {
	    	console.log("remove user");
	    	Users.deleteUser(req.params.user_id, function(err,response) {
	    		res.json({
					statusCode: 200,
					data: response
				}); 
	    	})
	    });

	router.route('/users')
		.post(function(req,res) {
			console.log(req.body);
			Users.createUser(req.body.id, req.body, function(response) {
		    	res.json({
					statusCode: 200,
					data: response
				});
			});
		})
		.get(function(req,res) {
			console.log("get all users");
			res.json({
				statusCode: 200,
				data: "get all users"
			});
		});
	return router;
}

function createImagesRoutes(router) {
	router.route('/images/:image_id')
	    .get(function(req, res) {
			console.log("testing api");
			redisLib.get("key", function(response) {
				console.log(response.toString());
				res.json({
					statusCode: 200,
					data: response.toString()
				}); 
			})
	    })
	    .put(function(req,res) {
	    	console.log("update image");
	    	res.json({
				statusCode: 200,
				data: "update image"
			});
	    }) 
	    .delete(function(req,res) {
	    	console.log("remove image");
	    	res.json({
				statusCode: 200,
				data: "delete image"
			});
	    });

	router.route('/images')
		.post(function(req,res) {
			console.log("create image");
	    	res.json({
				statusCode: 200,
				data: "create image"
			});
		})
		.get(function(req,res) {
			console.log("get all images");
			res.json({
				statusCode: 200,
				data: "get all images"
			});
		});
	return router;
}

module.exports = {
	create: create
};