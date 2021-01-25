const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const url = "mongodb://localhost:27017";

var _db;
const connect = (callback) => {
	MongoClient.connect( url,  { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
		_db  = client.db("time-tracker");
		console.log(`INFO: MongoDB Connected: ${ url }...`);
		return callback(err);
	} );
};

const getDB = () => {
	return _db;
}
module.exports.init = connect;
module.exports.getDB = getDB;
module.exports.ObjectId = ObjectId;
