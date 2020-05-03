import { Router } from 'express';
import path from 'path';
import orm from '../../database/orm';
import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import { illegalArgumentHandler, itemsHandler, right, formatResponseItem, formatResponseItems } from '../utils/controllerUtil';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
import AuthorizationException from '../../errors/AuthorizationException';
import { GROUPS } from '../../config/constants';
const MEDIA_PATH = path.join(process.env.PWD, 'media');
const TAG = 'MediaFileController';

function createFilePath(fk_tenant_id, fileId, fileType) {
	return path.join(MEDIA_PATH, `tenant_${fk_tenant_id}`, `${fileId}.${fileType}`);
}
class MediaFileController {
	constructor() {
		this.orm = orm;
	}

	/* istanbul ignore next */
	getRouter() {
		let router = Router();
		//let checkAuth = this.authenticationService.checkAuth;

		//router.get('/:realEstateId/:fileName', this.downloadFile);
		router.get('/:realEstateId', this.listRealEstateFiles);
		router.post('/:realEstateId', this.upload);
		router.get('/:realEstateId/:fileName', this.downloadMediaFile);
		router.get('/:id', this.download);

		router.post('/:realEstateId/files', this.uploadFiles);
		//router.delete('/mediaFiles/:id', this.deleteOne);
		//router.put('/mediaFiles/:id', this.updateOne);

		return router;
	}
	listMediaFiles = (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let realEstateId = req.params.realEstateId;
		let where = { fk_tenant_id };
		if (realEstateId) {
			where.fk_realEstate_id = realEstateId;
		}
		this.orm
			.MediaFile()
			.findAll({
				where,
			})
			.then(items => itemsHandler(req, res, items))
			.catch(e => illegalArgumentHandler(TAG, next, e));
	};

	downloadMediaFile = async (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let mediaFileId = req.params.mediaFileId;

		let MediaFile = this.orm.MediaFile();
		let { authType, groupMember, groupMemberId } = req.app.locals;
		console.log('req.app.locals.authType=' + authType);
		console.log('req.app.locals.groupMember=' + groupMember);
		console.log('req.app.locals.groupMemberId=' + groupMemberId);

		MediaFile.findByPk(mediaFileId)
			.then(mediaFile => {
				if (mediaFile === null) {
					next(new IllegalArgumentException(TAG, `No MediaFile with id=${mediaFileId}`));
					return;
				}
				try {
					let isTenantsFile = fk_tenant_id === mediaFile.fk_tenant_id;
					let minGroupRead = mediaFile.minGroupRead;
					let allowed = minGroupRead <= groupMemberId;
					if (groupMemberId >= GROUPS.tenantUser.id && !isTenantsFile) {
						allowed = false;
					}
					if (allowed) {
						let filePath = createFilePath(fk_tenant_id, mediaFileId, mediaFile.fileType);

						logger.info(TAG, `Download file. Path=${filePath}`);

						res.download(filePath); // Set disposition and send it.
					} else {
						next(new AuthorizationException(TAG, 'Unauthorized access'));
					}
				} catch (err) {
					next(new IllegalArgumentException(TAG, 'Failed to download file', err));
				}
			})
			.catch(e => new IllegalArgumentException(TAG, `Failed to get MediaFile with id ${mediaFileId}`, e));
	};

	/**
	 *Creates a new mediaFile item and stores the uploaded file
	 */
	uploadFile = async (req, res, next) => {
		if (!req.files) {
			next(new IllegalArgumentException(TAG, 'No files to upload in multi-part form-data found'));
			return;
		}
		// The files attribute contains the named files, e.g. in postman
		// select body / form-data, then add a key 'mediaFile' of type file
		// and select file to upload
		if (req.files.mediaFile_0) {
			next(); //treat by uploadFiles --> multiple file upload
			return;
		}

		let fk_tenant_id = req.app.locals.tenantId;

		let mediaFile = req.files.mediaFile;

		let fileType = right(mediaFile.name, 3);
		let { clientSideId, realEstateId, description, purpose, title } = req.body;

		let RealEstate = this.orm.RealEstate();
		RealEstate.findByPk(realEstateId)
			.then(realEstate => {
				// Make sure you can upload files for realEstates belonging to its own tenant
				let belongsToSameTenant = realEstate !== null && realEstate.fk_tenant_id === fk_tenant_id;
				if (!belongsToSameTenant) {
					throw new AuthorizationException(TAG, `RealEstate with id ${realEstateId} does not belong to tenant with id ${fk_tenant_id}`);
				}
				let MediaFile = this.orm.MediaFile();

				MediaFile.create({
					clientSideId,
					fk_realEstate_id: realEstateId,
					fk_tenant_id,

					fileName: mediaFile.name,
					size: mediaFile.size,
					mimeType: mediaFile.mimetype,

					title,
					description,
					fileType,
					purpose,
				})
					.then(createdMediaFile => {
						let filePath = createFilePath(fk_tenant_id, createdMediaFile.id, fileType);
						//Use the mv() method to place the file in upload directory (i.e. "uploads")
						mediaFile.mv(filePath);

						res.status(HttpStatusCodes.Created)
							.type('json')
							.send(
								formatResponseItem(req, createdMediaFile, {
									message: `File metadata created and file uploaded, get file with /api/mediaFiles/${createdMediaFile.id}`,
								})
							);
					})
					.catch(err => next(new IllegalArgumentException(TAG, err.message, err)));
			})
			.catch(err => next(new IllegalArgumentException(TAG, err.message, err)));
	};

	uploadFiles = async (req, res, next) => {
		let fk_tenant_id = req.headers.tenantId;
		try {
			if (!req.files) {
				next(new IllegalArgumentException(TAG, 'No files to upload in multi-part form-data found'));
			} else {
				let fk_tenant_id = req.app.locals.tenantId;

				let responseData = [];
				let { realEstateId } = req.body;

				let i = 0;
				let mediaFile;
				let promises = [];
				let MediaFile = this.orm.MediaFile();

				while ((mediaFile = req.files['mediaFile_' + i]) !== undefined) {
					//let filePath = path.join(MEDIA_PATH, `tenant_${tenantId}`, `ID-${createdMediaFile.id}_${mediaFile.name}`);
					let clientSideId = req.body[`clientSideId_${i}`];
					let title = req.body[`title_${i}`];
					let description = req.body[`description_${i}`];
					let purpose = req.body[`purpose_${i}`];
					let fileType = right(mediaFile.name, 3);

					promises.push(
						MediaFile.create({
							clientSideId,
							fk_realEstate_id: realEstateId,
							fk_tenant_id,

							fileName: mediaFile.name,
							size: mediaFile.size,
							mimeType: mediaFile.mimetype,

							title,
							description,
							fileType,
							purpose,
						})
					);

					i++;
				}
				Promise.all(promises)
					.then(createdMediaFiles => {
						let i = 0;
						while ((mediaFile = req.files['mediaFile_' + i]) !== undefined) {
							let fileType = right(mediaFile.name, 3);
							let createdMediaFile = createdMediaFiles[i];
							let filePath = createFilePath(fk_tenant_id, createdMediaFile.id, fileType);
							//Use the mv() method to place the file in upload directory (i.e. "uploads")
							mediaFile.mv(filePath);
							responseData.push(createdMediaFile);
							i++;
						}
						let meta = { message: `${responseData.length} MediaFiles created and uploaded` };
						res.status(HttpStatusCodes.Created)
							.type('json')
							.send(formatResponseItems(req, responseData, meta));
					})
					.catch(err => next(err));
			}
		} catch (err) {
			res.status(500).send(err);
		}
	};
}
export default new MediaFileController();
