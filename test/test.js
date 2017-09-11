var supertest 	= require("supertest");
var should 		= require("should");
var redis 		= require('redis');
var objects 	= require('./toTestObj');

var client 		= redis.createClient();

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
		client.del('user_1', function(err, response) {
			server
			.post('/users')
			.send(objects.user)
			.expect("Content-type",/json/)
			.expect(200)
			.end(function(err,res){
				res.status.should.equal(200);
				res.body.data.should.equal("OK");
				done();
			});
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