import { Router } from 'express';
import path from 'path';
import orm from '../../database/orm';
import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import { sendResponse, illegalArgumentHandler, sendItemsResponse, right, formatResponseItem, formatResponseItems } from '../utils/controllerUtil';
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

	listMediaFiles = (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let realEstateId = req.query.realEstateId;
		let where = { fk_tenant_id };
		if (realEstateId) {
			where.fk_realEstate_id = realEstateId;
		}
		this.orm
			.MediaFile()
			.findAll({
				where,
			})
			//.then(mediaFiles => sendItemsResponse(req, res, mediaFiles))
			.then(mediaFiles => sendResponse(req, res, next, HttpStatusCodes.Ok, 'items', mediaFiles))
			.catch(e => illegalArgumentHandler(TAG, next, e));
	};

	downloadMediaFile = async (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let mediaFileId = req.params.mediaFileId;

		let MediaFile = this.orm.MediaFile();
		let { authType, groupMember, groupMemberId, userOrIndividualId } = req.app.locals;
		console.log('req.app.locals.authType=' + authType);
		console.log('req.app.locals.groupMember=' + groupMember);
		console.log('req.app.locals.groupMemberId=' + groupMemberId);

		let mediaFile = await MediaFile.findByPk(mediaFileId);
		//	.then(mediaFile => {
		if (mediaFile === null) {
			next(new IllegalArgumentException(TAG, `No MediaFile with id=${mediaFileId}`));
			return;
		}
		try {
			let isTenantsFile = fk_tenant_id === mediaFile.fk_tenant_id;
			let minGroupRead = mediaFile.minGroupRead;

			// Do not deliver file if minGroupRead is <= groupMemberId
			let allowed = minGroupRead <= groupMemberId;

			// do not deliver file if a tenant user tries to get a file of another tenant
			if (groupMemberId >= GROUPS.tenantUser.id && !isTenantsFile) {
				throw new AuthorizationException(
					TAG,
					`Not allowed to download mediaFile of a different tenant (tenantId=${fk_tenant_id}, mediaFile.fk_tenant_id=${mediaFile.fk_tenant_id}`
				);
			}
			// Override allowed flag if an individual permission is set
			if (minGroupRead === GROUPS.individualWithGrantedPermission.id && groupMemberId === GROUPS.individual.id) {
				// Check permissions
				let IndividualMediaFilePermission = this.orm.IndividualMediaFilePermission();
				let permissions = await IndividualMediaFilePermission.findAll({
					where: { fk_individual_id: userOrIndividualId, fk_mediaFile_id: mediaFileId },
				});
				if (permissions.length === 0) {
					throw new AuthorizationException(TAG, 'Unauthorized access by individual with no exact permission');
				}
				allowed = true;
			}

			if (allowed) {
				let filePath = createFilePath(fk_tenant_id, mediaFileId, mediaFile.fileType);
				logger.info(TAG, `Download file. Path=${filePath}`);
				res.download(filePath); // Set disposition and send it.
			} else {
				next(new AuthorizationException(TAG, 'Unauthorized access'));
			}
		} catch (err) {
			next(err);
		}
	};

	allowAccess = async (req, res, next) => {
		let mediaFileId = req.params.mediaFileId;
		let individualId = req.params.individualId;
		try {
			let IndividualMediaFilePermission = this.orm.IndividualMediaFilePermission();
			let permission = await IndividualMediaFilePermission.create({
				fk_individual_id: individualId,
				fk_mediaFile_id: mediaFileId,
			});

			sendResponse(req, res, next, HttpStatusCodes.Created, 'createdIndividualMediaFilePermission', permission);
		} catch (err) {
			next(new IllegalArgumentException(TAG, 'Failed to giveAccess. Cause:' + err.message, err));
		}
	};
	revokeAccess = async (req, res, next) => {
		let mediaFileId = req.params.mediaFileId;
		let individualId = req.params.individualId;
		try {
			let IndividualMediaFilePermission = this.orm.IndividualMediaFilePermission();
			let permissions = await IndividualMediaFilePermission.findAll({
				where: {
					fk_individual_id: individualId,
					fk_mediaFile_id: mediaFileId,
				},
			});
			for (let i = 0; i < permissions.length; i++) {
				await permissions[i].destroy();
			}

			sendResponse(req, res, next, HttpStatusCodes.Created, 'revokedIndividualMediaFilePermissions', permissions);
		} catch (err) {
			next(new IllegalArgumentException(TAG, 'Failed to revokeAccess. Cause:' + err.message, err));
		}
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
		try {
			let realEstate = await RealEstate.findByPk(realEstateId);

			// Make sure you can upload files for realEstates belonging to its own tenant
			let belongsToSameTenant = realEstate !== null && realEstate.fk_tenant_id === fk_tenant_id;
			if (!belongsToSameTenant) {
				throw new AuthorizationException(TAG, `RealEstate with id ${realEstateId} does not belong to tenant with id ${fk_tenant_id}`);
			}
			let MediaFile = this.orm.MediaFile();

			let createdMediaFile = await MediaFile.create({
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
			});
			let filePath = createFilePath(fk_tenant_id, createdMediaFile.id, fileType);
			//Use the mv() method to place the file in upload directory (i.e. "uploads")
			mediaFile.mv(filePath);
			sendResponse(req, res, next, HttpStatusCodes.Created, 'createdMediaFile', createdMediaFile, {
				message: `File metadata created and file uploaded, get file with /api/mediaFiles/${createdMediaFile.id}`,
			});
		} catch (err) {
			next(new IllegalArgumentException(TAG, err.message, err));
		}
	};

	uploadFiles = async (req, res, next) => {
		if (!req.files) {
			next(new IllegalArgumentException(TAG, 'No files to upload in multi-part form-data found'));
			return;
		}
		let fk_tenant_id = req.app.locals.tenantId;

		let responseData = [];
		let { realEstateId } = req.body;
		let RealEstate = this.orm.RealEstate();
		let realEstate = await RealEstate.findByPk(realEstateId);

		// Make sure you can upload files for realEstates belonging to its own tenant
		let belongsToSameTenant = realEstate !== null && realEstate.fk_tenant_id === fk_tenant_id;
		if (!belongsToSameTenant) {
			next(new AuthorizationException(TAG, `RealEstate with id ${realEstateId} does not belong to tenant with id ${fk_tenant_id}`));
			return;
		}
		let i = 0;
		let mediaFile;
		let promises = [];
		let MediaFile = this.orm.MediaFile();

		while ((mediaFile = req.files['mediaFile_' + i]) !== undefined) {
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
				sendResponse(req, res, next, HttpStatusCodes.Created, 'createdMediaFiles', responseData, meta);
			})
			.catch(err => next(err));
	};
}
export default new MediaFileController();
