'use strict';


function Likes(config, link) {
	this.config = config;
	this.Link = link;
	this.getLikes = getLikes;
	this.setLike = setLike;
	this.removeLike = removeLike;
}

function createLikesController(config, link) {
	return new Likes(config, link);
}


function getLikes(userId, callback) {
	var config = this.config;
	config.redisLib.getFromSet(config.likesKey+userId, function(err, response) {
		if (err) callback(err, null);
		if (response) {
			return callback(null, response);
		} else {
			return callback(null, null);
		}
	})
}

function setLike(userId, userIdLiked, callback) {
	var config = this.config;
	var Link = this.Link;
	//agrego el userIdLiked a likes_userId. Luego chequeo en likes_userIdLiked si esta el userId.
	// SI está hay un nuevo link. 
	// SIno agregar en los around en campo like: true
	config.redisLib.addToSet(config.likesKey+userId, userIdLiked, function (err, response) {
		if (err) return callback(err, null);
		//save info of like in around 
		config.redisLib.setHashField(config.aroundKey+userId+':'+userIdLiked, 'like', true, function (err, responseSave) {
			if (err) return callback(err, null);
			//chequeo si el otro usuario dio like a userId
			config.redisLib.isMember(config.likesKey+userIdLiked, userId, function (err, response) {
				if (err) return callback(err, null);
				//si dio like. Hay un nuevo link
				if (response) {
					Link.createLink(userId, userIdLiked, function (err, response) {
						if (err) return callback(err, null);
						return callback(null, response);
					});
				} else {
					return callback(null, true);
				}
			});
			
		});
		
	})
}

function removeLike(userId, userIdUnlike, callback) {
	var config = this.config;
	var Link = this.Link;
	//elimino el userIdUnlike de likes_userId. 
	// SI está hay un nuevo link. 
	// SIno agregar en los around en campo like: true
	config.redisLib.removeFromSet(config.likesKey+userId, userIdUnlike, function (err, response) {
		if (err) return callback(err, null);
		if (!response) {
			return callback(null, false);
		} else {
			//save info of like in around 
			config.redisLib.setHashField(config.aroundKey+userId+':'+userIdUnlike, 'like', false, function (err, responseSave) {
				if (err) return callback(err, null);
				if (response) {
					Link.removeLink(userId, userIdUnlike, function (err, response) {
						if (err) return callback(err, null);
						return callback(null, response);
					});
				}
				
			});
		}
	})
}

module.exports = {
	createLikesController: createLikesController,
	getLikes: getLikes,
	setLike: setLike,
	removeLike: removeLike
}