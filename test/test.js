var supertest 	= require("supertest");
var should 		= require("should");
var redis 		= require('redis');
var client 		= redis.createClient();

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:8080/api/linkup");

var user = {
	id: "1",
	name: "Martin Gonzalez",
	picture: {
		data: {
			url: "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2"
		}
    },
	likes: {
		data: 
		[
			{
				name: "Mike Chouhy"
			},
			{
				name: "MuleSoft"
			},
			{
				name: "MuleSoft Argentina"
			},
			{
				name: "Travel Buenos Aires"
			},
			{
				name: "Deporte Fiuba"
			}
		]
	},
	gender: "male",
	education: 
	[
		{
			school: {
				name: "Colegio Nuestra Señora de la Misericordia"
			},
			type: "High School"
		},
		{
			school: {
				name: "FIUBA Facultad de Ingenieria (UBA)"
			},
			type: "College"
		}
	]
};

var userResponse = { 
	education: 
  	[ 
  		{ 
  			name: 'Colegio Nuestra Señora de la Misericordia',
       		type: 'High School' 
       	},
     	{ 
     		name: 'FIUBA Facultad de Ingenieria (UBA)', 
     		type: 'College' 
     	} 
     ],
  	userName: 'Martin Gonzalez',
  	likes: 
   	[ 
   		{ 
   			name: 'Mike Chouhy' 
   		},
     	{ 
     		name: 'MuleSoft' 
     	},
     	{ 
     		name: 'MuleSoft Argentina' 
     	},
     	{ 
     		name: 'Travel Buenos Aires' 
     	},
     	{
     	 name: 'Deporte Fiuba' 
     	} 
    ],
  	id: '1',
  	gender: 'male',
  	pictures: '',
 	description: '',
  	picture: 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2' 
}


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
			.send(user)
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
		.send(user)
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
			JSON.stringify(res.body.data).should.equal(JSON.stringify(userResponse));
			done();
		});


	});


});