var supertest 	= require("supertest");
var should 		= require("should");
var redis 		= require('redis');
var objects 	= require('./toTestObj');

var client 		= redis.createClient({'db': 5});

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:8080/api/linkup");

// UNIT test begin

describe("LinkUp API Test",function(){
	// #1 should return home page

	it("should return home page",function(done){
		// calling home page api
		server
		.get("/")
		.expect("Content-type",/json/)
		.expect(200) // THis is HTTP response
		.end(function(err,res){
			// HTTP status should be 200
			res.status.should.equal(200);
			// Error key should be false.
			res.body.data.should.equal("Welcome to linkup API");
			done();
		});
	});

});

describe("LinkUp API User Test",function(){

	it("Create an user",function(done){
		client.flushdb( function (err, succeeded) {
			client.del('user_1', function(err, res) {
				server
				.post('/users')
				.send(objects.user)
				.expect("Content-type",/json/)
				.expect(200)
				.end(function(err,res){
					res.status.should.equal(200);
					JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.userResponse));
					done();
				});
				
			})
		})

	});

	it("Create an user, should return 404, user already exists",function(done){
		server
		.post("/users")
		.send(objects.user)
		.expect(404)
		.end(function(err,res){
			res.status.should.equal(404);
			res.body.data.should.equal("User already exists");
			done();
		});
	})

	it("Get an user",function(done){
		server
		.get('/users/1')
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.userResponse));
			done();
		});


	});

	it("Update an user",function(done){
		server
		.put('/users/1')
		.send({description: 'Me gusta mucho viajar'})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			res.body.data.should.equal("OK");
			server
			.get('/users/1')
			.end(function(err,res){
				JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.userUpdatedResponse));
				done();
			})
		});
	});

	it("Delete an user",function(done){
		server
		.delete('/users/1')
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			res.body.data.should.equal("OK");
			server
			.get('/users/1')
			.end(function(err,res){
				res.status.should.equal(404);
				res.body.data.should.equal("User 1 not found");
				done();
			})
		});
	});
});

describe("LinkUp API Preferences Test",function(){

	it("Create user's preferences",function(done){
		client.flushdb( function (err, succeeded) {
			server
			.post('/users')
			.send(objects.user)
			.end(function(err,res){
				  server
					.post('/users/1/preferences')
					.send(objects.malePreferences)
					.expect("Content-type",/json/)
					.expect(200)
					.end(function(err,res){
						res.status.should.equal(200);
						res.body.data.should.equal("OK");
						done();
					});
			});
		});

	});


	it("Get user's preferences",function(done){
		server
		.get('/users/1/preferences')
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.preferencesResponse));
			done();
		});


	});

	it("Update user's preferences",function(done){
		server
		.put('/users/1/preferences')
		.send({
			distance: 5,
			minAge: 20,
			maxAge: 35,
			searchMode:"couple"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			res.body.data.should.equal("OK");
			server
			.get('/users/1/preferences')
			.end(function(err,res){
				JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.preferencesUpdated));
				done();
			})
		});
	});
});

describe("LinkUp API Around Users Test",function(){

	it("Get users around a female searching male",function(done){
		client.flushall( function (err, succeeded) {
			server
			.post('/users')
			.send(objects.femaleUser)
			.expect(200)
			.end(function (err, res) {
				server
				.post('/users')
				.send(objects.maleUserTwo)
				.expect(200)
				.end(function (err, res) {
					server
					.post('/users/2/preferences')
					.send(objects.femalePreferences)
					.expect(200)
					.end(function (err, res) {
						server
						.post('/users/4/preferences')
						.send(objects.malePreferences)
						.expect(200)
						.end(function (err, res) {
						  	server
							.get('/users/4/around')
							.expect(200)
							.end(function (err, res) {
								JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.maleUserAroundTwo));
								done();
							})	
					
							
							
						})			
					})	
				})			
			})
		});
	});

	it("Get users around a male searching female",function(done){
		client.flushall( function (err, succeeded) {
			server
			.post('/users')
			.send(objects.femaleUser)
			.expect(200)
			.end(function (err, res) {
				server
				.post('/users')
				.send(objects.maleUserTwo)
				.expect(200)
				.end(function (err, res) {
					server
					.post('/users/2/preferences')
					.send(objects.femalePreferences)
					.expect(200)
					.end(function (err, res) {
						server
						.post('/users/4/preferences')
						.send(objects.malePreferences)
						.expect(200)
						.end(function (err, res) {
						  	server
							.get('/users/2/around')
							.expect(200)
							.end(function (err, res) {
								JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.femaleUserAround));
								done();
							})	
					
							
							
						})			
					})	
				})			
			})
		});
	});

	it("Get users around a female searching female",function(done){
		client.flushall( function (err, succeeded) {
			server
			.post('/users')
			.send(objects.femaleUserTwo)
			.expect(200)
			.end(function (err, res) {
				server
				.post('/users')
				.send(objects.femaleUserFour)
				.expect(200)
				.end(function (err, res) {
					server
					.post('/users/5/preferences')
					.send(objects.femalePreferences)
					.expect(200)
					.end(function (err, res) {
						server
						.post('/users/8/preferences')
						.send(objects.femalePreferences)
						.expect(200)
						.end(function (err, res) {
							server
							.get('/users/5/around')
							.expect(200)
							.end(function (err, res) {
								JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.femaleUserAroundFour));
								done();
							})	
							
							
						})			
					})		
				})			
			})
		});
	});

	it("Get users around a male searching male",function(done){
		client.flushall( function (err, succeeded) {
			server
			.post('/users')
			.send(objects.user)
			.expect(200)
			.end(function (err, res) {
				server
				.post('/users')
				.send(objects.maleUserFour)
				.expect(200)
				.end(function (err, res) {
					server
					.post('/users/1/preferences')
					.send(objects.malePreferences)
					.expect(200)
					.end(function (err, res) {
						server
						.post('/users/7/preferences')
						.send(objects.malePreferences)
						.expect(200)
						.end(function (err, res) {
							server
							.get('/users/1/around')
							.expect(200)
							.end(function (err, res) {
								JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.maleUserAroundFour));
								done();
							})	
							
							
						})			
					})		
				})			
			})
		});
	});

	it("Get users around a user searching both",function(done){
		client.flushall( function (err, succeeded) {
			server
			.post('/users')
			.send(objects.maleUserThree)
			.expect(200)
			.end(function (err, res) {
				server
				.post('/users')
				.send(objects.femaleUserThree)
				.expect(200)
				.end(function (err, res) {
					server
					.post('/users/3/preferences')
					.send(objects.bothPreferences)
					.expect(200)
					.end(function (err, res) {
						server
						.post('/users/6/preferences')
						.send(objects.bothPreferences)
						.expect(200)
						.end(function (err, res) {
							server
							.get('/users/3/around')
							.expect(200)
							.end(function (err, res) {
								JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.femaleUserAroundThree));
								done();
							})	
							
							
						})			
					})		
				})			
			})
		});
	});
	/*it("Get user's preferences",function(done){
		server
		.get('/users/1/preferences')
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.preferencesResponse));
			done();
		});


	});

	it("Update user's preferences",function(done){
		server
		.put('/users/1/preferences')
		.send({
			distance: 5,
			minAge: 20,
			maxAge: 35,
			searchMode:"couple"
		})
		.expect("Content-type",/json/)
		.expect(200)
		.end(function(err,res){
			res.status.should.equal(200);
			res.body.data.should.equal("OK");
			server
			.get('/users/1/preferences')
			.end(function(err,res){
				JSON.stringify(res.body.data).should.equal(JSON.stringify(objects.preferencesUpdated));
				done();
			})
		});
	});*/
});

client.quit();