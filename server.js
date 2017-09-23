'use strict';
// BASE SETUP
// =============================================================================

// call the packages we need
var express    		= require('express');        // call express
var bodyParser 		= require('body-parser');
var async 			= require('async');
var cluster 		= require('cluster');

var config 			= require('./config');

var Routes 			= require('./routes');
var elasticSearch 	= require('./elasticSearchLib');

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
   
    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
	var app        	= express();                 // define our app using express

	var routerExpress = express.Router();              // get an instance of the express Router
	var routes = Routes.create(routerExpress, config);


	// configure app to use bodyParser()
	// this will let us get the data from a POST
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	var port = process.env.PORT || 8080;        // set our port

	// all of our routes will be prefixed with /api/linkup
	app.use('/api/linkup', routes);
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

	elasticSearch.indexExists('users', function(err, res) {
		if (err) {
			console.log("Error checking if index exists");
			console.log(err);
		}
		if(res) {
			/*elasticSearch.getMapping('users', function (err, res) {
				if (err) {
					console.log("==== Error getting mapping ====");
				}
				if (!res) {*/
					elasticSearch.initMapping('users', 'user', properties, function(err, res) {
						if (err) {
							console.log("err");
							console.log(err);
						}
						if (res) {
							//console.log(res);
						}
					});
				/*}
				
			});*/
		} else {
			elasticSearch.createIndex('users', function(err, res) {
				if (err) {
					console.log("err creating index");
					console.log(err);
				} 
				if (res) {
					elasticSearch.initMapping('users', 'user', properties, function(err, res) {
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
		
	

	// START THE SERVER
	// =============================================================================
	app.listen(port);
	console.log('Magic happens on port ' + port);
    
}