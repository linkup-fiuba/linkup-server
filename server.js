'use strict';
// BASE SETUP
// =============================================================================

// call the packages we need
var express    	= require('express');        // call express
var bodyParser 	= require('body-parser');
var async 		= require('async');

var config 		= require('./config');
var Routes 		= require('./routes');

var app        	= express();                 // define our app using express

var routerExpress = express.Router();              // get an instance of the express Router
var routes = Routes.create(routerExpress);


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port


// all of our routes will be prefixed with /api/linkup
app.use('/api/linkup', routes);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);