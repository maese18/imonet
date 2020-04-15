import { Router } from 'express';
import fs from 'fs';
import path from 'path';
//import authenticationService from '../../services/authenticationService';
import configs from '../config/configs';
import logger from '../utils/logger/logger';

//import logger from '../utils/logger';
const TAG = 'MediaController';

class MediaController {
	constructor() {
		//this.authenticationService = authenticationService;
	}

	/* istanbul ignore next */
	getRouter() {
		let router = Router();
		//let checkAuth = this.authenticationService.checkAuth;

		router.get('', this.listFiles);
		router.get('/:fileName', this.downloadFile);

		return router;
	}

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
	listFiles = (req, res, next) => {
		//let tenant = configs.customer; //TODO: Tenant needs to be extracted from JWT

		const filePath = path.join(process.env.PWD, 'media');
		//const filePath = path.join(__dirname, 'media', fileName);

		fs.readdir(filePath, (err, filenames) => {
			res.send(JSON.stringify(filenames, null, 2));
		});
	};
}
const mediaController = new MediaController();
export default mediaController;
