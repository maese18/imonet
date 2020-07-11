import { MongoClient } from 'mongodb';
import logger from '../utils/logger/logger';
import configs from '../config/configs';
import mongoDbInitializer from '../processes/mongodb-initializer';

const TAG = 'mongodb';

// Connection URL
const c = configs.mongo;
const dbName = c.database;
const CONNECTION_URL = `mongodb://${c.user}:${c.password}@${c.host}:${c.port}/${dbName}`;

// Create a new MongoClient
// const client = new MongoClient(CONNECTION_URL);

class MongoDb {
	constructor() {
		this.db;
		this.client;
	}
	async init() {
		try {
			logger.info(TAG, `Try to connect ${CONNECTION_URL}`);

			// Use connect method to connect to the Server
			this.client = await MongoClient.connect(CONNECTION_URL);

			this.db = this.client.db(dbName);
			logger.info(TAG, 'Successfully connected to mongodb ' + CONNECTION_URL);

			mongoDbInitializer.init();
		} catch (err) {
			console.log('failed to connect to mongodb', err.stack);
		}
	}
}
const mongoDb = new MongoDb();
mongoDb.init();
export default mongoDb;
