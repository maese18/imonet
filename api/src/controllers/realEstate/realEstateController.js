import { Router } from 'express';
import path from 'path';
import orm from '../../database/orm';
import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../../controllers/utils/HttpStatusCodes';
import shortId from 'shortid';
const TAG = 'RealEstateController';
class RealEstateController {
	constructor() {
		logger.info(TAG, 'RealEstateController initialized');
	}

	/* istanbul ignore next */
	getRouter() {
		let router = Router();
		//let checkAuth = this.authenticationService.checkAuth;

		router.get('', this.findAll);
		router.post('', this.create);
		return router;
	}
	findAll = (req, res, next) => {
		let fk_tenant_id = req.query.tenantId;
		orm.RealEstate()
			.findAll({ include: orm.MediaFile() })
			.then(result => {
				res.status(HttpStatusCodes.Ok).json({ headers: req.headers, result });
			})
			.catch(e => {
				logger.error(TAG, e.message, e);
				next(e);
			});
	};
	create = (req, res, next) => {
		let fk_tenant_id = req.query.tenantId;
		let { clientSideId, title, description, street, zipCode, city } = req.body;
		orm.RealEstate()
			.create({ clientSideId, fk_tenant_id, title, description, street, zipCode, city })
			.then(created => {
				logger.info(TAG, `Created RealEstate Object ${created}`);
				res.json(created);
			})
			.catch(e => {
				logger.error(TAG, e.message, e);
				next(e);
			});
	};
}

const realEstateController = new RealEstateController();
export default realEstateController;
