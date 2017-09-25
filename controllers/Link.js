'use strict';


function Link(config) {
	this.config = config;
	this.getLinks = getLinks;
	this.createLink = createLink;
	this.removeLink = removeLink;
}

function createLinkController(config) {
	return new Link(config);
}


function getLinks(userId, callback) {
	
}

function createLink(userId, userIdLinked, callback) {
	var config = this.config;
	//agrego a links_userId el userIdLi
	config.redisLib.addToSet(config.linksKey+userId, userIdLinked, function (err, response) {
		if (err) return callback(err, null);
		if (!response) {
			return callback(null, false);
		} else {
			config.redisLib.addToSet(config.linksKey+userIdLinked, userId, function (err, response) {
				if (err) return callback(err, null);
				if (!response) {
					return callback(null, false);
				} else {
					//obtengo la data del usuario con el que linkeo
					config.redisLib.getHash(config.usersKey+userIdLinked, function (err, user) {
			    		if (err) return callback(err, null, null);
			    		if (!user) {
			    			return callback(null, false);
			    		} else {
			    			//obtengo la data del usuario con el que linkeo
							config.redisLib.getHash(config.usersKey+userId, function (err, myUser) {
					    		if (err) return callback(err, null, null);
					    		if (!myUser) {
					    			return callback(null, false);
					    		} else {
					    			if (myUser) {
						    			var userLinkedModel = {
						    				id: userIdLinked,
						    				name: user.name,
						    				dateOfLink: Date.now(),
						    				picture: user.picture
						    			}

						    			var myUserModel = {
						    				id: userId,
						    				name: myUser.name,
						    				dateOfLink: Date.now(),
						    				picture: myUser.picture
						    			}

						    			//guargo la info del match
						    			config.redisLib.setHash(config.linkKey+userId+":"+userIdLinked, userLinkedModel, function (err, responseSave) {
						    				if (err) return callback(err, null);
											else {
												//guargo la info del match
								    			config.redisLib.setHash(config.linkKey+userIdLinked+":"+userId, myUserModel, function (err, responseSave) {
								    				if (err) return callback(err, null);
													else return callback(null,true);
								    			});
											}
						    			});
					    			} else {
					    				return callback(null, false);
					    			}
					    		}
					    	});

			    			
			    		}
			    	});
				}
			})
		}
	});
}

function removeLink(userId, userIdUnlinked, callback) {
	var config = this.config;
	//elimino el userIdUnlinked de likes_userId. 
	// SI está hay un nuevo link. 
	// SIno agregar en los around en campo like: true
	config.redisLib.removeFromSet(config.linksKey+userId, userIdUnlinked, function (err, response) {
		if (err) return callback(err, null);
		if (!response) {
			return callback(null, false);
		} else {
			config.redisLib.removeFromSet(config.linksKey+userIdUnlinked, userId, function (err, response) {
				if (err) return callback(err, null);
				if (!response) {
					return callback(null, false);
				} else {
					//remove info of link
					config.redisLib.deleteKey(config.linksKey+userId+':'+userIdUnlinked, function (err, responseSave) {
						if (err) return callback(err, null);
						//remove info of link
						config.redisLib.deleteKey(config.linksKey+userIdUnlinked+':'+userId, function (err, responseSave) {
							if (err) return callback(err, null);
							return callback(null, true);
						});
						
					});
				}
			});

			
		}
	})
}

module.exports = {
	createLinkController: createLinkController,
	createLink: createLink,
	getLinks: getLinks,
	removeLink: removeLink
}