import { formatResponseItem, formatResponseItems } from '../utils/controllerUtil';
import orm from '../../database/orm';
import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../../controllers/utils/HttpStatusCodes';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
const TAG = 'RealEstateController';
class RealEstateController {
	/* istanbul ignore next */
	constructor() {
		logger.info(TAG, 'RealEstateController initialized');
		this.orm = orm;
	}

	/**
	 * Returns all RealEstates objects including attached Media files for the given tenant
	 * POST /api/realEstates body:{}
	 */
	findAll = (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;

		this.orm
			.RealEstate()
			.findAll({ where: { fk_tenant_id }, include: this.orm.MediaFile() })
			.then(items => {
				/* istanbul ignore next */
				res.status(HttpStatusCodes.Ok)
					.type('json')
					.send(formatResponseItems(req, items));
			})

			.catch(e => {
				/* istanbul ignore next */
				next(new IllegalArgumentException(TAG, e.message));
			});
	};

	/**
	 * Returns all RealEstates objects including attached Media files for the given tenant
	 * POST /api/realEstates/:realEstateId body:{}
	 */
	findOne = (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let realEstateId = req.params.realEstateId;
		this.orm
			.RealEstate()
			.findOne({ where: { fk_tenant_id, id: realEstateId }, include: this.orm.MediaFile() })
			.then(item => {
				/* istanbul ignore next */
				res.status(HttpStatusCodes.Ok)
					.type('json')
					.send(formatResponseItem(req, item));
			})
			.catch(e => {
				/* istanbul ignore next */
				next(new IllegalArgumentException(TAG, e.message));
			});
	};

	/**
	 * Creates a RealEstate Object
	 */
	create = (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let { clientSideId, title, description, street, zipCode, city } = req.body;
		this.orm
			.RealEstate()
			.create({ clientSideId, fk_tenant_id, title, description, street, zipCode, city })
			.then(created => {
				res.status(HttpStatusCodes.Created)
					.type('json')
					.send(formatResponseItem(req, created));
			})
			.catch(e => {
				/* istanbul ignore next */
				next(new IllegalArgumentException(TAG, e.message));
			});
	};
}

const realEstateController = new RealEstateController();
export default realEstateController;
