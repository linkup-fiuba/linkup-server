var redisLib 			= require('./redisLib');
var elasticSearchLib 	= require('./elasticSearchLib');
var async 				= require('async');
var groupByTime 		= require('group-by-time');
var helpers 			= require('./helpers');
const uuidv1 			= require('uuid/v1');

var config = {};


config.ESLib = elasticSearchLib;
config.limitDefault = 10;
config.distanceUnitDefault = 'km';
config.maxDistanceSearchDefault = 50;
config.maxAgeDefault = 99;
config.maxLikesPremium = 5;
config.maxLikesCommon = 1;

config.aroundKey = 'around_';
config.preferencesKey = 'preferences_';
config.genderKey = 'gender_';
config.usersKey = 'user_';
config.premiumKey = 'premium_';
config.maxLikesKey = 'likes_max_';
config.likesKey = 'likes_';
config.linksKey = 'links_';
config.linkKey = 'link_';
config.reportedUserKey = 'reported_user_';
config.reportedKey = 'reported_';
config.blockedKey = 'blocked_';
config.shown = '_shown';
config.bothKey = 'both';
config.redisLib = redisLib;
config.groupByTime = groupByTime;
config.helpers = helpers;
config.async = async.default;
config.uuidv1 = uuidv1;
config.reportOptions = [
	"Mensajes inapropiados",
    "Comportamiento extraño",
	"Spam"
]

module.exports = config;

