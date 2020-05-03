import { Router } from 'express';
import path from 'path';
import orm from '../../database/orm';
import logger from '../../utils/logger/logger';
import shortId from 'shortid';
const MEDIA_PATH = path.join(process.env.PWD, 'media');
const TAG = 'MediaFileController';
class MediaFileController {
	constructor() {}

	listMediaFiles = (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let realEstateId = req.params.realEstateId;

		orm.MediaFile()
			.findAll({
				where: {
					fk_realEstate_id: realEstateId,
				},
			})
			.then(result => {
				res.send({
					status: true,
					message: `Files of realEstate with id=${realEstateId}`,
					items: result,
				});
			})
			.catch(err => next(err));
	};
	//TODO: Document and define a lookup query
	download = (req, res, next) => {
		//let tenant = configs.customer; //TODO: Tenant needs to be extracted from JWT
		let tenantId = req.query.tenantId;
		let id = req.params.id;
		orm.MediaFile()
			.findByPk(id)
			.then(mediaFile => {
				const filePath = path.join(process.env.PWD, 'media', mediaFile.fileNameHash);
				logger.info(TAG, `Download file. Path=${filePath}`);
				try {
					res.download(filePath); // Set disposition and send it.
				} catch (err) {
					next(err);
				}
			})
			.catch(err => next(err));
	};

	//TODO: Document and define a lookup query
	downloadFile = (req, res, next) => {
		//let tenant = configs.customer; //TODO: Tenant needs to be extracted from JWT

		//let module = req.params.module;
		let fileName = req.params.fileName;
		const filePath = path.join(process.env.PWD, 'media', fileName);
		logger.info(TAG, `Download file. Path=${filePath}`);
		try {
			res.download(filePath); // Set disposition and send it.
		} catch (err) {
			next(err);
		}
	};
	upload = async (req, res, next) => {
		try {
			if (!req.files) {
				res.send({
					status: false,
					message: 'No file uploaded',
				});
			} else {
				let mediaFile = req.files.mediaFile;
				let realEstateId = req.params.realEstateId;
				let tenantId = req.app.locals.tenantId;
				let description = req.headers.description;
				let MediaFile = orm.MediaFile();

				MediaFile.create({
					fk_realEstate_id: realEstateId,
					fk_tenant_id: tenantId,
					fileName: mediaFile.name,
					fileNameAlias: mediaFile.name,
					description,
					type: mediaFile.mimetype,
				})
					.then(createdMediaFile => {
						//Use the mv() method to place the file in upload directory (i.e. "uploads")
						let filePath = path.join(MEDIA_PATH, `tenant_${tenantId}`, `ID-${createdMediaFile.id}_${mediaFile.name}`);
						mediaFile.mv(filePath);
						//send response
						res.send({
							status: true,
							message: 'File is uploaded',
							data: {
								created: createdMediaFile,
								name: mediaFile.name,
								mimetype: mediaFile.mimetype,
								size: mediaFile.size,
							},
						});
					})
					.catch(err => next(err));
			}
		} catch (err) {
			res.status(500).send(err);
		}
	};
	downloadMediaFile = async (req, res, next) => {
		//let tenant = configs.customer; //TODO: Tenant needs to be extracted from JWT
		let tenantId = req.query.tenantId;
		//let realEstateId = req.params.realEstateId;
		let fileName = req.params.fileName;
		const filePath = path.join(process.env.PWD, 'media', 'tenant_' + tenantId, fileName);
		logger.info(TAG, `Download file. Path=${filePath}`);
		try {
			res.download(filePath); // Set disposition and send it.
		} catch (err) {
			next(err);
		}
	};
	uploadFiles = async (req, res, next) => {
		try {
			if (!req.files) {
				res.send({
					status: false,
					message: 'No file uploaded',
				});
			} else {
				let realEstateId = req.params.realEstateId;
				let purpose = req.headers.purpose;
				let tenantId = req.headers.tenantid;
				let responseData = [];

				let i = 0;
				let mediaFile;
				let promises = [];
				while ((mediaFile = req.files['mediaFile_' + i]) !== undefined) {
					let MediaFile = orm.MediaFile();
					//let filePath = path.join(MEDIA_PATH, `tenant_${tenantId}`, `ID-${createdMediaFile.id}_${mediaFile.name}`);
					let fileName = `${shortId.generate()}_${mediaFile.name}`;
					let filePath = path.join(MEDIA_PATH, `tenant_${tenantId}`, fileName);
					mediaFile.mv(filePath);

					promises.push(
						MediaFile.create({
							fk_realEstate_id: realEstateId,
							fk_tenant_id: tenantId,
							purpose: purpose,
							fileName: fileName,
							fileNameAlias: mediaFile.name,
							type: mediaFile.mimetype,
							size: mediaFile.size,
						})
					);

					i++;
				}
				Promise.all(promises)
					.then(createdMediaFiles => {
						createdMediaFiles.forEach(createdMediaFile => {
							responseData.push(createdMediaFile);
							//responseData.push({ name: createdMediaFile.fileNameAlias, mimeType: createdMediaFile.type, size: createdMediaFile.size });
						});
						//send response
						res.send({
							status: true,
							message: 'Files uploaded',
							created: responseData,
						});
					})
					.catch(err => next(err));
			}
		} catch (err) {
			res.status(500).send(err);
		}
	};
}
export default new MediaFileController();
