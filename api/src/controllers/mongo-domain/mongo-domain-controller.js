import mongoDb from '../../database/mongodb';
import { ObjectID } from 'mongodb';

import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import IllegalArgumentException from '../../errors/IllegalArgumentException';

const TAG = 'MongoDomainController';

class MongoDomainController {
	constructor() {
		this.mongoDbAdapter = mongoDb;
	}
	dispatchPostRequests = (req, res, next) => {
		let method = req.body.method;
		switch (method) {
			case 'insert':
				this.insert(req, res, next);
				break;
			case 'updateOne':
				this.updateOne(req, res, next);
				break;
			case 'find':
				this.findAllAsPost(req, res, next);
				break;
			default:
				logger.info(TAG, `No implementation for method ${method}`);
		}
	};

	/**
	 * Insert one or many documents.
	 * @param (body) The request body contains the object to insert
	 */
	insert = (req, res, next) => {
		let collection = req.params.collection;
		let insertObjectOrObjects = req.body.data;

		if (Array.isArray(insertObjectOrObjects)) {
			this.insertMany(req, res, next);
		} else {
			insertObjectOrObjects.createdAt = new Date();
			this.mongoDbAdapter.db
				.collection(collection)
				.insertOne(insertObjectOrObjects)
				.then(result => {
					//res.json(result);
					if (result.insertedCount === 1) {
						res.status = HttpStatusCodes.Created;
						res.json({ collection, inserted: result.ops, insertedIds: { '0': result.insertedId } });
					} else {
						throw new IllegalArgumentException(TAG, 'Undefined exception when inserting document');
					}
				})
				.catch(e => next(e));
		}
	};

	/**
	 * Insert documents.
	 * @param (body) The request body contains the array of objects to insert
	 */
	insertMany = (req, res, next) => {
		let collection = req.params.collection;

		this.mongoDbAdapter.db
			.collection(collection)
			.insertMany(req.body.data)
			.then(result => {
				if (result.insertedCount >= 1) {
					res.status = HttpStatusCodes.Created;
					res.json({ collection, inserted: result.ops, insertedIds: result.insertedIds });
				} else {
					throw new IllegalArgumentException(TAG, 'Undefined exception when inserting document');
				}
			})
			.catch(e => next(e));
	};

	updateOne = (req, res, next) => {
		let collection = req.params.collection;
		let updateObject = req.body.data;
		let id = updateObject._id;
		console.log(`update ${collection} document with id='${id}`);
		console.log(updateObject);
		this.mongoDbAdapter.db
			.collection(collection)
			.updateOne({ _id: ObjectID(req.params.id) }, { $set: updateObject, $currentDate: { lastModified: true } })
			.then(result => {
				logger.info(TAG, `UpdateOne executed and result=${JSON.stringify(result, null, 2)}`);
				if (result.modifiedCount === 0) {
					throw new IllegalArgumentException(TAG, `Collection ${collection} got no item with id=${id}`);
				}
				db.collection(collection)
					.findOne({ _id: ObjectID(id) })
					.then(result => {
						console.log(`Found ${JSON.stringify(result)}`);
						res.json({ updated: result });
					})
					.catch(e => next(e));
			})
			.catch(err => {
				console.log(err);
				res.json(err);
			});
	};

	findByPk = (req, res, next) => {
		let collection = req.params.collection;
		let id = req.params.id;
		try {
			this.mongoDbAdapter.db
				.collection(collection)
				.findOne({ _id: ObjectID(id) })
				.then(result => {
					console.log(`Found ${JSON.stringify(result)}`);
					if (result) {
						res.json(result);
					} else {
						next(new IllegalArgumentException(TAG, `No item ${collection}/${id}`));
					}
				})
				.catch(e => {
					next(new IllegalArgumentException(TAG, `Failed to get item ${collection}/${id}`, e));
				});
		} catch (e) {
			// catches for example wrong ObjectId, e.g. too short id
			next(new IllegalArgumentException(TAG, `Failed to get item ${collection}/${id}. Reason:${e.message}`, e));
		}
	};

	/**
	 * Find all objects of the given collection, matching the query parameters.
	 * @param {query} Query Object in form of attribute:[filter criteria], e.g. {"rooms":{"$gt":4}} or "type":"EFH", see https://docs.mongodb.com/manual/tutorial/query-documents/
	 * @param {sort} Sort object in form of attribute:[sort direction, 1=asc, -1=desc]
	 * @param {project} Projection object. A value of 1 means this attribute is included in the result. If we have one 0 at least, all other attributes are included.
	 *                  See: https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/
	 */
	findAll = ({ query = {}, sort = {}, project = {}, req, res, next }) => {
		let collection = req.params.collection;

		let cursor = this.mongoDbAdapter.db.collection(collection).find({});

		if (Object.keys(sort).length > 0) {
			cursor = cursor.sort(sort);
		}

		if (Object.keys(project).length > 0) {
			cursor.project(project);
		}

		console.log(`findOneOf collection ${collection}, query=${JSON.stringify(query)}`);
		cursor
			.toArray()
			.then(result => {
				console.log(`Found ${JSON.stringify(result)}`);
				res.json({ items: result });
			})
			.catch(err => {
				logger.error(TAG, err);
				next(new IllegalArgumentException(TAG, 'Query failed. Reason:' + err.message, err));
			});
	};

	findAllAsGet = (req, res, next) => {
		let parameterObject = req.query;
		try {
			let query = parameterObject.where ? JSON.parse(parameterObject.where) : {};
			let sort = parameterObject.sort ? JSON.parse(parameterObject.sort) : {};
			let project = parameterObject.project ? JSON.parse(parameterObject.project) : {};

			this.findAll({ query, sort, project, req, res, next });
		} catch (e) {
			logger.error(TAG, e.message, e);
			next(e);
		}
	};

	findAllAsPost = (req, res, next) => {
		let { query, sort, project } = req.body.params;
		this.findAll({ query, sort, project, req, res, next });
	};
}
export default new MongoDomainController();
