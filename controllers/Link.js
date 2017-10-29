'use strict';


function Link(config) {
	this.config = config;
	this.getLinks = getLinks;
	this.createLink = createLink;
	this.removeLink = removeLink;
	this.blockLink = blockLink;
	this.unblockLink = unblockLink;
}

function createLinkController(config) {
	return new Link(config);
}


function getLinks(userId, callback) {
	var config = this.config;
	config.redisLib.getFromSet(config.linksKey+userId, function (err, ids) {
		var links = [];
		config.async.each(ids, function (id, callbackIt) {
			config.redisLib.getHash(config.linkKey+userId+":"+id, function (err, linkData) {
				if (err) return callbackIt(err, null);
				if (!linkData) {
					return callbackIt();
				} else {
					var linkObj = {
						id: linkData.id,
						name: linkData.name,
						picture: linkData.picture,
						dateOfLink: linkData.dateOfLink,
						block: (linkData.block != undefined) ? linkData.block : false,
						disable: (linkData.disable != undefined) ? linkData.disable : false 
					};

					links.push(linkObj);
					return callbackIt();					
				}
			});
		}, function finish(err) {
			if (err) return callback(err, null);
			return callback(null, links);
		});

	})
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
						    				picture: user.picture,
						    				block: false,
						    				disable: false
						    			}

						    			var myUserModel = {
						    				id: userId,
						    				name: myUser.name,
						    				dateOfLink: Date.now(),
						    				picture: myUser.picture,
						    				block: false,
						    				disable: false
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


function blockLink(userId, userIdUnlinked, callback) {
	var config = this.config;
	//elimino el userIdUnlinked de likes_userId. 
	// SI está hay un nuevo link. 
	// SIno agregar en los around en campo like: true
	config.redisLib.removeFromSet(config.linksKey+userIdUnlinked, userId, function (err, response) {
		if (err) return callback(err, null);
		if (!response) {
			return callback(null, false);
		} else {
			config.redisLib.setHashField(config.linksKey+userId+':'+userIdUnlinked, 'block', true, function (err, response) {
				if (err) return callback(err, null);
				config.redisLib.setHashField(config.linksKey+userIdUnlinked+':'+userId, 'block', true, function (err, response) {
					if (err) return callback(err, null);
					return callback(null, true);
				});
			});
		}
	})
}

function unblockLink(userId, userIdUnlinked, callback) {
	var config = this.config;
	//elimino el userIdUnlinked de likes_userId. 
	// SI está hay un nuevo link. 
	// SIno agregar en los around en campo like: true
	config.redisLib.addToSet(config.linksKey+userIdUnlinked, userId, function (err, response) {
		if (err) return callback(err, null);
		if (!response) {
			return callback(null, false);
		} else {
			config.redisLib.setHashField(config.linksKey+userId+':'+userIdUnlinked, 'block', false, function (err, response) {
				if (err) return callback(err, null);
				config.redisLib.setHashField(config.linksKey+userIdUnlinked+':'+userId, 'block', false, function (err, response) {
					if (err) return callback(err, null);
					return callback(null, true);
				});
			});
		}
	});
} 

module.exports = {
	createLinkController: createLinkController,
	createLink: createLink,
	getLinks: getLinks,
	removeLink: removeLink,
	blockLink: blockLink,
	unblockLink: unblockLink
}