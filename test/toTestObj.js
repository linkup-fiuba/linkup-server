
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


var femaleUser = {
  id: "2",
  name: "Samanta Loiza",
  picture: {
    data: {
      url: "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2"
    }
  },
  likes: {
    data: 
    [
      {
        name: "Bersuit Vergarabat"
      },
      {
        name: "Caligaris"
      },
      {
        name: "FEVA"
      },
      {
        name: "Metrovoley"
      },
      {
        name: "Deporte Fiuba"
      }
    ]
  },
  gender: "female",
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

var malePreferences = {
  gender: "male", 
  distance: "10",
  minAge: "25",
  maxAge: "35",
  mode: "visible",
  searchMode:"friendship"
}

var femalePreferences = {
  gender: "female", 
  distance: "5",
  minAge: "20",
  maxAge: "28",
  mode: "visible",
  searchMode:"couple"
}

var bothPreferences = {
  gender: "both", 
  distance: "15",
  minAge: "20",
  maxAge: "38",
  mode: "visible",
  searchMode:"couple"
}

var preferencesUpdated = {
  userId: "1",
  gender: "male", 
  distance: "5",
  minAge: "20",
  maxAge: "35",
  mode: "visible",
  searchMode:"couple"
}

var preferencesResponse = {
  userId: "1",
  gender: "male",
  distance: "10",
  minAge: "25",
  maxAge: "35",
  mode: "visible",
  searchMode: "friendship"
}

var maleUserAround = [
  {
    id: "1",
    userName: "Martin Gonzalez" ,
    picture: "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2",
    description: "",
    compatibility: "1"
  }
]

var femaleUserAround = [
{
  id: "2",
  userName: "Samanta Loiza" ,
  picture: "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13912571_10154556791580967_9146574132461188875_n.jpg?oh=480f549e46d5aff420ffa44a616a0167&oe=5A5CF8A2",
  description: "",
  compatibility: "1"
}
]

module.exports = {
  user: user,
  femaleUser: femaleUser,
  userResponse: userResponse,
  userUpdatedResponse: userUpdatedResponse,
  bothPreferences: bothPreferences,
  femalePreferences: femalePreferences,
  malePreferences: malePreferences,
  preferencesResponse: preferencesResponse,
  preferencesUpdated: preferencesUpdated,
  femaleUserAround: femaleUserAround,
  maleUserAround: maleUserAround
}