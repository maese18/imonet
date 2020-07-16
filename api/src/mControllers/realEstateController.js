import mongoDb from '../database/mongodb';
import { ObjectID } from 'mongodb';
import path from 'path';
import logger from '../utils/logger/logger';
import HttpStatusCodes from '../controllers/utils/HttpStatusCodes';
import { sendResponse, illegalArgumentHandler, sendItemsResponse, right, formatResponseItem, formatResponseItems } from '../controllers/utils/controllerUtil';
import IllegalArgumentException from '../errors/IllegalArgumentException';
import AuthorizationException from '../errors/AuthorizationException';
import ShortUniqueId from 'short-unique-id';
import { GROUPS } from '../config/constants';
import { fstat } from 'fs';
import fs from 'fs';
import realEstateUtils from './realEstateUtils';
const MEDIA_PATH = path.join(process.env.PWD, 'media');
const TAG = 'RealEstateController';
const COLLECTION = 'realEstates';
function createFilePath(tenantId, fileId, fileType) {
	return path.join(MEDIA_PATH, `${tenantId}`, `${fileId}.${fileType}`);
}
class RealEstateController {
	constructor() {
		this.mongoDbAdapter = mongoDb;

		this.shortUniqueId = new ShortUniqueId();
	}

	createOne = (req, res, next) => {
		let created = {};
		res.json(created);
	};

	updateOne = (req, res, next) => {
		let id = req.params.id;
		let found = {};
		res.json(found);
	};

	findOne = (req, res, next) => {
		let id = req.params.id;
		let found = {};
		res.json(found);
	};

	findAll = (req, res, next) => {};

	deleteOne = (req, res, next) => {
		let id = req.params.id;
		let found = {};
		res.json(found);
	};
	/**
	 * Request path: m-api/realEstates/:realEstateId/files/:fileId
	 * Request method: DELETE
	 * @param {*} req
	 * @param {*} res
	 * @param {*} next
	 */
	deleteFile = (req, res, next) => {
		let tenantId = req.app.locals.tenantId;
		let realEstateId = req.params.id;
		let fileId = req.params.fileId;
		logger.info(TAG, `deleteFile for tenant=${tenantId}, realEstateId=${realEstateId} fileId=${fileId}`);

		let mId = ObjectID(realEstateId);

		this.mongoDbAdapter.db
			.collection(COLLECTION)
			.findOne({ _id: mId })
			.then(realEstate => {
				let referencedFileInd = -1;
				realEstate.files.forEach((file, ind) => {
					if (file.id === fileId) {
						referencedFileInd = ind;
					}
				});
				if (referencedFileInd < 0) {
					throw new Error(`No file with id ${fileId}`);
				} else {
					// Delete in file list
					let fileType = realEstate.files[referencedFileInd].fileType;
					realEstate.files.splice(referencedFileInd, 1);

					// Delete on file system
					let tenantUploadFolder = path.join(MEDIA_PATH, tenantId);
					let fileName = `${realEstate._id}_${fileId}.${fileType}`;
					fs.unlinkSync(path.join(tenantUploadFolder, fileName));
					realEstateUtils
						.updateOne(this.mongoDbAdapter.db, realEstate, mId)
						.then(response => {
							let meta = { message: `${response.result.modifiedCount} file deleted` };
							sendResponse(req, res, next, HttpStatusCodes.Ok, 'data', response.updated, meta);
						})
						.catch(err => next(err));
				}
			})
			.catch(err => {
				logger.error(TAG, `Failed to delete file from realEstate object with id ${realEstateId}`, err);
				next(err);
			});
	};
	/**
	 *
	 * @param {*} req
	 * 	headers: 	Authorization=Bearer jwttoken
	 *
	 *  formData: for each upload file add a key value pair (with [ind] replaced with the index only) of
	 * 				realEstateId
	 *
	 * 				title_[ind]
	 * 				description_[ind]
	 * 				mediaFile_[ind] => the upload file
	 * 				purpose_[ind] => the purpose of the file
	 *
	 * @param {*} res
	 * @param {*} next
	 */
	uploadFiles = (req, res, next) => {
		if (!req.files) {
			next(new IllegalArgumentException(TAG, 'No files to upload in multi-part form-data found'));
			return;
		}
		let tenantId = req.app.locals.tenantId;
		let realEstateId = req.params.id;
		logger.info(TAG, `uploadFiles for tenant=${tenantId}, realEstateId=${realEstateId}`);

		let mId = ObjectID(realEstateId);

		this.mongoDbAdapter.db
			.collection(COLLECTION)
			.findOne({ _id: mId })
			.then(realEstate => {
				// Make sure you can upload files for realEstates belonging to its own tenant
				let belongsToSameTenant = realEstate !== null && realEstate.tenantId === tenantId;
				if (!belongsToSameTenant) {
					next(new AuthorizationException(TAG, `RealEstate with id ${realEstateId} does not belong to tenant with id ${tenantId}`));
					return;
				}
				let i = 0;
				let mediaFile;
				if (!realEstate.files) {
					realEstate.files = [];
				}
				// Cleanup all files not referenced in realEstate object and vice versa
				let tenantUploadFolder = path.join(MEDIA_PATH, tenantId);
				let realEstateDiskFiles = fs.readdirSync(tenantUploadFolder).filter(file => file.indexOf(realEstateId) === 0);
				let fileIds = realEstate.files.map(file => realEstateId + '_' + file.id + '.' + file.fileType);

				// Delete all files on disk which are not referenced by the realEstate.files attribute
				realEstateDiskFiles.filter(file => fileIds.indexOf(file) < 0).forEach(file => fs.unlinkSync(path.join(tenantUploadFolder, file)));

				// Delete all files having no references on disk
				let ind = fileIds.length - 1;
				while (ind >= 0) {
					if (realEstateDiskFiles.indexOf(fileIds[ind]) < 0) {
						realEstate.files.splice(ind, 1);
					}
					ind--;
				}
				// Upload files from request bodies
				while ((mediaFile = req.files['mediaFile_' + i]) !== undefined) {
					let clientSideId = req.body[`clientSideId_${i}`];
					let title = req.body[`title_${i}`];
					let description = req.body[`description_${i}`];
					let purpose = req.body[`purpose_${i}`];
					let fileType = right(mediaFile.name, 3);

					// Random UUID
					const id = this.shortUniqueId();
					let filePath = createFilePath(tenantId, realEstateId + '_' + id, fileType);

					//Use the mv() method to place the file in upload directory (i.e. "uploads")
					mediaFile.mv(filePath);

					realEstate.files.push({
						clientSideId,
						id,

						fileName: mediaFile.name,
						size: mediaFile.size,
						mimeType: mediaFile.mimetype,

						title,
						description,
						fileType,
						purpose,
					});
					i++;
				}

				let uploadedFilesCount = i;
				delete realEstate['lastModified']; // if we do not delete attribute we will face an exception

				realEstateUtils
					.updateOne(this.mongoDbAdapter.db, realEstate, mId)
					.then(response => {
						let meta = { message: `${uploadedFilesCount} files uploaded` };
						sendResponse(req, res, next, HttpStatusCodes.Created, 'data', response.updated, meta);
					})
					.catch(err => next(err));
			})
			.catch(err => {
				logger.error(TAG, `No realEstate object with id ${realEstateId}`, err);
				next(err);
			});
	};
}
export default new RealEstateController();
