import { formatResponseItem, formatResponseItems, sendResponse } from '../utils/controllerUtil';
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
				sendResponse(req, res, next, HttpStatusCodes.Ok, 'items', items);
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
				sendResponse(req, res, next, HttpStatusCodes.Ok, 'item', item);
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
		let { realEstate } = req.body;
		this.orm
			.RealEstate()
			.create({ ...realEstate, fk_tenant_id })
			.then(created => {
				sendResponse(req, res, next, HttpStatusCodes.Created, 'created', created, {
					message: `Created RealEstate with id ${created.id}`,
				});
			})
			.catch(e => {
				/* istanbul ignore next */
				next(new IllegalArgumentException(TAG, e.message));
			});
	};

	/**
	 * Saves an instance if it contains an id or creates a new object if not
	 */
	save = async (req, res, next) => {
		let fk_tenant_id = req.app.locals.tenantId;
		let { realEstate } = req.body;
		realEstate.fk_tenant_id = fk_tenant_id;
		if (realEstate.id) {
			let realEstateObject = await this.orm.RealEstate().findByPk(realEstate.id);
			realEstateObject
				.update({ ...realEstate, fk_tenant_id })
				.then(updated => {
					sendResponse(req, res, next, HttpStatusCodes.Created, 'updated', updated, {
						message: `Saved RealEstate with id ${updated.id}`,
					});
				})
				.catch(e => {
					/* istanbul ignore next */
					console.log(e);
					next(new IllegalArgumentException(TAG, e.message));
				});
		} else {
			this.create(req, res, next);
		}
	};
}

const realEstateController = new RealEstateController();
export default realEstateController;
