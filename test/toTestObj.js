
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
  	id: '1',
  	userName: 'Martin Gonzalez',
  	picture: 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2',
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
  	gender: 'male',
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
 	description: '',
  	pictures: ''
}

var userUpdatedResponse = { 
  	id: '1',
  	userName: 'Martin Gonzalez',
  	picture: 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2',
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
  	gender: 'male',
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
 	description: 'Me gusta mucho viajar',
  	pictures: ''
}

var preferences = {

}


module.exports = {
  user: user,
  userResponse: userResponse,
  userUpdatedResponse: userUpdatedResponse,
  preferences: preferences
}