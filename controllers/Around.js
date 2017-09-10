'use strict';
var async 		= require('async');
var redisLib 	= require('../redisLib');
var config	 	= require('../config');

var aroundKey = 'around_';
var shown = '_shown';

function getAroundUsers(userId, callback) {
	redisLib.getFromSet(aroundKey+userId, function(err, userIdSet) {
		if (err) callback(err, null);
		redisLib.getFromSet(aroundKey+userId+shown, function(err, userIdSetShown) {
			getUsersAround(userId, userIdSet, userIdSetShown, function (err, users) {
				if (err) return callback(err, null);
				return callback(null, users);
			})
		})
	})
}

function deleteAroundUser(userId, userIdRemove, callback) {
	redisLib.removeFromSet(aroundKey+userId, userIdRemove, function (err, replySet) {
		if (err) return callback(err, null);
		redisLib.removeFromSet(aroundKey+userIdRemove, userId, function (err, replySetTwo) {
			if (err) return callback(err, null);
			redisLib.deleteKey(aroundKey+userId+':'+userIdRemove, function (err, replyRemOne) {
				if (err) return callback(err, null);
				redisLib.deleteKey(aroundKey+userIdRemove+':'+userId, function (err, replyRemTwo) {
					if (err) return callback(err, null);
					return callback(null, replyRemTwo);
				})		
			})
		})
	})
} 

function getUsersAround(userId, userIdsAround, userIdsAroundShown, cbUserAround) {
	var users = [];
	
	var limit = config.limit;
	var i = 0;

	async.waterfall([
	    function getDiff(callback) {
	    	var arrayDiff = userIdsAround.diff(userIdsAroundShown);
			if (arrayDiff.length == 0) {
				arrayDiff = userIdsAround;
				redisLib.deleteKey(aroundKey+userId+shown, function (err, replyRem) {
					if (err) return callback(err, null);
					callback(null, arrayDiff);
				});	
			} else {
				callback(null, arrayDiff);
			}
	    },
	    function iterate(arrayDiff, callbackIteration) {
	    	async.each(arrayDiff, function (id, callbackIds) {
				redisLib.getHash(aroundKey+userId+':'+id, function (err, user) {
					if (!user) {
						callbackIds();
					} else {
						if (i == limit) {
							return callbackIds(null, users);
						} else {
							i++;
							users.push(user);
							redisLib.addToSet(aroundKey+userId+shown, id, function(err, response) {
								callbackIds();
							})
						}
					}
				})

			}, function finish(err) {
	    		return callbackIteration(null, users);
			});
	    	
	    }
	], function (error, users) {
	    if (error) {
	    	return cbUserAround(error, null);
	    }
	    return cbUserAround(null, users);
	});

}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

module.exports = {
	getAroundUsers: getAroundUsers,
	deleteAroundUser: deleteAroundUser
}