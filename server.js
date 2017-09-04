// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express');        // call express
var app        	= express();                 // define our app using express
var bodyParser 	= require('body-parser');
var request 	= require('request');
var async 		= require('async');
var config 		= require('./config');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router
// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log(req.method+' '+req.url);
    next(); // make sure we go to the next routes and don't stop here
});


router.route('/user/:user_id')
    .get(function(req, res) {
		console.log("testing api");
		res.json({
					statusCode: 200,
					data: "testing"
				}); 
    });

// all of our routes will be prefixed with /api/linkup
app.use('/api/linkup', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);