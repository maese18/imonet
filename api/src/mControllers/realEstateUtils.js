import { ObjectID } from 'mongodb';
import logger from '../utils/logger/logger';
const COLLECTION = 'realEstates';
const TAG = 'realEstateUtils';
export const updateOne = (db, realEstate, mId) => {
	delete realEstate['lastModified']; // if we do not delete attribute we will face an exception
	return new Promise((resolve, reject) => {
		db.collection(COLLECTION)
			.updateOne({ _id: ObjectID(realEstate._id) }, { $set: realEstate, $currentDate: { lastModified: true } })
			.then(async result => {
				if (result.modifiedCount !== 1) {
					throw new IllegalArgumentException(TAG, `Collection ${COLLECTION} got no item with id=${realEstate._id}`);
				}
				logger.info(TAG, `Updated realEstate result=${JSON.stringify(result, null, 2)}`);
				let updated = await db.collection(COLLECTION).findOne({ _id: mId });
				resolve({ result, updated });
			})
			.catch(err => {
				console.log(err);
				reject(err);
			});
	});
};

export default {
	updateOne,
};
