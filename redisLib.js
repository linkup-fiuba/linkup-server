'use strict';

var redis 		= require('redis');
var config 		= require('./config');

// create a new redis client and connect to our local redis instance
var client = redis.createClient();

// if an error occurs, print it to the console
client.on('error', function (err) {
    console.log("Error " + err);
});

client.on('connect', function() {
    console.log('Connected to Redis');
});


function set(key, value) {
	client.set(key, value);
	return;
}

function get(key, callback) {
	client.get(key, function(err, reply) {
		if (err) callback(err, null);
		return callback(null, reply);    
	})
}

function setHash(key, value) {
	client.hmset(key, value);
	return;
}

function getHash(key, callback) {
	client.hgetall(key, function(err, reply) {
		if (err) callback(err, null);
		return callback(null, reply);
	});
}

function deleteKey(key, callback) {
	client.del(key, function(err, reply) {
		if (err) callback(err, null);
		return callback(null, reply);
	});
}


module.exports = {
	set: set,
	get: get,
	getHash: getHash,
	setHash: setHash,
	deleteKey: deleteKey
}