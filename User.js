var redisLib 	= require('./redisLib');

var userKey = 'user_';

function getUser(userId, callback) {
	redisLib.getHash(userKey+userId, function(err,response) {
		if (err) callback(err, null);
		return callback(null, response);
	})
}

function createUser(userId, user, callback) {
	redisLib.setHash(userKey+userId, user);
	return callback(user);
}


function updateUser(userId, user, callback) {
	//get Old and update new fields
	redisLib.setHash(userKey+userId, user);
	return callback(user);
}

function deleteUser(userId, callback) {
	redisLib.deleteKey(userKey+userId, function(err, response) {
		if (err) callback(err, null);
		return callback(null, response);
	});
} 

module.exports = {
	getUser: getUser,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser
}


