import mongoDb from '../database/mongodb';
import logger from '../utils/logger/logger';
import User from '../mongo/User';
const TAG = 'mongodb-initializer';

export default {
	init() {
		let db = mongoDb.db;
		db.collection('tenants')
			.findOne({ _id: 'tenant_001' })
			.then(result => {
				if (result === null) {
					db.collection('tenants')
						.insertMany([
							{ _id: 'tenant_001', name: 'First Tenant' },
							{ _id: 'tenant_002', name: 'Second Tenant' },
						])
						.then(result => {
							logger.info(TAG, `Inserted tenants ${JSON.stringify(result)}`);

							let user = User.create({ email: 'info@ad.ch', password: 'pw', tenantId: 'tenant_001' });
							db.collection('users')
								.insertOne(user)
								.then(result => {
									console.log('Created User ', result);
								})
								.catch(e => {
									console.log('Error while inserting User', e);
								});
						});
					// an index was created like so:
					const collection = db.collection('users');
					// Create the index
					collection.createIndex({ email: -1 }, { unique: true }, function(err, result) {
						console.log(result);
					});

					db.collection('realEstates')
						.createIndex({ description: 'text', title: 'text' })
						.then(result => {
							console.log('text index created on realEstates description and title ', result);
						})
						.catch(e => {
							console.log('failed to create text index', e);
						});
					//However this is not necessary because we use the email as id which in turn is unique
				}
				logger.info(TAG, 'Found tenant, no update necessary' + JSON.stringify(result));
			})

			.catch(e => {
				logger.error(TAG, e.message, e);
			});
	},
};
