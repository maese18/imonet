import { db, ObjectID } from '../../database/mongodb';
import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
const TAG = 'MongoDomainController';

class MongoDomainController {
	/**
	 * Insert one or many documents.
	 * @param (body) The request body contains the object to insert
	 */
	insert = (req, res, next) => {
		let collection = req.params.collection;
		let insertObjectOrObjects = req.body;

		if (Array.isArray(insertObjectOrObjects)) {
			this.insertMany(req, res, next);
		} else {
			insertObjectOrObjects.createdAt = new Date();
			db.collection(collection)
				.insertOne(insertObjectOrObjects)
				.then(result => {
					//res.json(result);
					if (result.insertedCount === 1) {
						res.status = HttpStatusCodes.Created;
						res.json({ created: result.ops, insertedIds: { '0': result.insertedId } });
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

		db.collection(collection)
			.insertMany(req.body)
			.then(result => {
				if (result.insertedCount >= 1) {
					res.status = HttpStatusCodes.Created;
					res.json({ created: result.ops, insertedIds: result.insertedIds });
				} else {
					throw new IllegalArgumentException(TAG, 'Undefined exception when inserting document');
				}
			})
			.catch(e => next(e));
	};

	updateOne = (req, res, next) => {
		let collection = req.params.collection;
		let id = req.params.id;
		console.log(`update ${collection} document with id='${id}`);
		console.log(req.body);
		db.collection(collection)
			.updateOne({ _id: ObjectID(req.params.id) }, { $set: req.body, $currentDate: { lastModified: true } })
			.then(result => {
				console.log('Updated the document with the field a equal to 2');
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

		db.collection(collection)
			.findOne({ _id: ObjectID(id) })
			.then(result => {
				console.log(`Found ${JSON.stringify(result)}`);
				res.json(result);
			})
			.catch(e => next(e));
	};
	/**
	 *
	 * @param {query} Query Object in form of attribute:[filter criteria], e.g. {"rooms":{"$gt":4}} or "type":"EFH", see https://docs.mongodb.com/manual/tutorial/query-documents/
	 * @param {sort} Sort object in form of attribute:[sort direction, 1=asc, -1=desc]
	 * @param {project} Projection object. A value of 1 means this attribute is included in the result. If we have one 0 at least, all other attributes are included.
	 *                  See: https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/
	 */
	findAll = ({ query = {}, sort = {}, project = {}, req, res, next }) => {
		let collection = req.params.collection;

		let cursor = db.collection(collection).find(query);

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
				res.json(result);
			})
			.catch(err => {
				logger.error(TAG, err);
				next(err);
			});
	};

	findAllAsGet = (req, res, next) => {
		let parameterObject = req.query;
		try {
			let query = parameterObject.query ? JSON.parse(parameterObject.query) : {};
			let sort = parameterObject.sort ? JSON.parse(parameterObject.sort) : {};
			let project = parameterObject.project ? JSON.parse(parameterObject.project) : {};

			this.findAll({ query, sort, project, req, res, next });
		} catch (e) {
			logger.error(TAG, e.message, e);
			next(e);
		}
	};

	findAllAsPost = (req, res, next) => {
		let { query, sort, project } = req.body;
		this.findAll({ query, sort, project, req, res, next });
	};
}
export default new MongoDomainController();
