import { MongoClient, ObjectID } from 'mongodb';
import assert from 'assert';
import logger from '../utils/logger/logger';

const TAG = 'mongodb';

// Connection URL
const url = 'mongodb://imonet:imonet@localhost:27017/imonet';

// Database Name
const dbName = 'imonet';

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
let db;
client.connect(function(err) {
	assert.equal(null, err);
	logger.info(TAG, 'Successfully connected to mongodb ' + url);

	db = client.db(dbName);
});

export { db, client, ObjectID };
