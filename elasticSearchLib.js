var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'debug'
}, function(err, response) {
	if (err) return callback(err, null);
	return callback(null, response);
});



function createClient() {
	var client = new elasticsearch.Client({
	  host: 'localhost:9200',
	  log: 'debug'
	}, function(err, response) {
		if (err) return callback(err, null);
		return callback(null, response);
	});
}

function pingClient() {

	client.ping({
	  // ping usually has a 3000ms timeout
	  requestTimeout: 1000
	}, function (error) {
	  if (error) {
	    console.trace('elasticsearch cluster is down!');
	  } else {
	    console.log('All is well');
	  }
	});
	
}


function createIndex(indexName, callback) {
	client.indices.create({
		index: indexName
	}, function (error, response) {
		if (error) return callback(error, null);
		return callback(null, response);
	});
}

function dropIndex(indexName) {
  client.indices.delete({
    index: indexName,
  }, function (error, response) {
  	if (error) return callback(error, null);
  	return callback(null, response);
  });
}


function addToIndex(indexName, indexType, id, indexBody, callback) {
  client.index({
    index: indexName,
    type: indexType,
    id: id,
    body: indexBody
  }, function (error, response) {
  	if (error) {
  		return callback(error, null);
  	} else {
	  	console.log("=== add to index ===");
	  	console.log(indexBody);
	  	return callback(null, response);
  	}
  });
}

function deleteFromIndex(indexName, indexType, id, callback) {
	client.delete({  
	  index: indexName,
	  id: id,
	  type: indexType
	}, function(error, response) {
		if (error) return callback(error, null);
  		return callback(null, response);
	});
}


function searchInIndex(indexName, indexType, indexMatch, callback) {
	client.search({  
		index: indexName,
		type: indexType,
		body: indexMatch
		
	}, function (error, response, status) {
		if (error){
			console.log("search error: "+error);
			return callback(error, null);
		} else {
			console.log(response.hits);
			return callback(null, response.hits.hits);
		}
	});
}

function updateInIndex(indexName, indexType, callback) {

}

function indexExists(indexName, callback) {
	client.indices.exists({
		index: indexName
	}, function (err, res) {
		if (err) {
			return callback(err, null);
		} 
		return callback(null, res);
	})
}

function initMapping(indexName, indexType, properties, callback) {  
    client.indices.putMapping({
        index: indexName,
        type: indexType,
        body: properties
     }, function (err, res) {
     	if (err) return callback(err, null);
     	if (res) {
     		return callback(null, res);
     	} else {
     		return callback(null, null);
     	}
     }
    );
}

function getMapping(indexName, callback) {
	client.indices.getMapping({index: indexName}, function(error, response) {
    if (error) {
        console.log("error");
        console.log(error);
        return callback(error, null);
    } else {
    	console.log("MAPPING");
        console.log(response.users);
        console.log(null, response);
    }
});
}


function closeConnection() {
  client.close();
}

module.exports = {
	//elasticsearchClient: client,
	createClient: createClient,
	createIndex: createIndex,
	dropIndex: dropIndex,
	addToIndex: addToIndex,
	deleteFromIndex: deleteFromIndex,
	searchInIndex: searchInIndex,
	pingClient: pingClient,
	indexExists: indexExists,
	initMapping: initMapping,
	getMapping: getMapping
}