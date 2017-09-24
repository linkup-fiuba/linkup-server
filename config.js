var redisLib 			= require('./redisLib');
var elasticSearchLib 	= require('./elasticSearchLib');
var async 				= require('async');

var config = {};


config.ESLib = elasticSearchLib;
config.limitDefault = 10;
config.distanceUnitDefault = 'km';
config.maxDistanceSearchDefault = 50;
config.maxAgeDefault = 99;
config.aroundKey = 'around_';
config.preferencesKey = 'preferences_';
config.genderKey = 'gender_';
config.usersKey = 'user_';
config.shown = '_shown';
config.bothKey = 'both';
config.redisLib = redisLib;
config.async = async.default;

module.exports = config;

