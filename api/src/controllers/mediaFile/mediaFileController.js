import { Router } from 'express';
import path from 'path';
import sequelizeAdapter from '../../database/sequelizeAdapter';
import logger from '../../utils/logger/logger';
import shortId from 'shortid';
const MEDIA_PATH = path.join(process.env.PWD, 'media');
const TAG = 'MediaFileController';
class MediaFileController {
	constructor() {}

	/* istanbul ignore next */
	getRouter() {
		let router = Router();
		//let checkAuth = this.authenticationService.checkAuth;

		router.get('/:fileName', this.downloadFile);
		router.get('/:realEstateId/:fileName', this.downloadMediaFile);
		router.get('/:id', this.download);
		router.post('/:realEstateId', this.upload);
		router.post('/:realEstateId/files', this.uploadFiles);
		//router.delete('/mediaFiles/:id', this.deleteOne);
		//router.put('/mediaFiles/:id', this.updateOne);

		return router;
	}

	//TODO: Document and define a lookup query
	download = (req, res, next) => {
		//let tenant = configs.customer; //TODO: Tenant needs to be extracted from JWT
		let tenantId = req.query.tenantId;
		let id = req.params.id;
		sequelizeAdapter.MediaFile.findByPk(id)
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
				let tenantId = req.headers.tenantid;
				let description = req.headers.description;
				let MediaFile = sequelizeAdapter.models.mediaFile;
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
		let realEstateId = req.params.realEstateId;
		let fileName = req.params.fileName;
		const filePath = path.join(process.env.PWD, 'media', 'tenant_' + realEstateId, fileName);
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
				let tenantId = req.headers.tenantid;
				let responseData = [];

				let i = 0;
				let mediaFile;
				let promises = [];
				while ((mediaFile = req.files['mediaFile_' + i]) !== undefined) {
					let MediaFile = sequelizeAdapter.models.mediaFile;
					//let filePath = path.join(MEDIA_PATH, `tenant_${tenantId}`, `ID-${createdMediaFile.id}_${mediaFile.name}`);
					let fileName = `${shortId.generate()}_${mediaFile.name}`;
					let filePath = path.join(MEDIA_PATH, `tenant_${tenantId}`, fileName);
					mediaFile.mv(filePath);

					promises.push(
						MediaFile.create({
							fk_realEstate_id: realEstateId,
							fk_tenant_id: tenantId,
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
							responseData.push({ name: createdMediaFile.fileNameAlias, mimeType: createdMediaFile.type, size: createdMediaFile.size });
						});
						//send response
						res.send({
							status: true,
							message: 'Files uploaded',
							data: responseData,
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
