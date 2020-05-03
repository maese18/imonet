import { Router } from 'express';
import configs from '../../config/configs';
import { stringify, stringifyNoWrap } from '../../utils/utils';
import {
	formatResponse,
	getAllRequestArguments,
	getFilterArguments,
	getMultiTenancyFilter,
	buildResponseObject,
	getDomain,
	getTenantId,
} from '../utils/controllerUtil';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import logger from '../../utils/logger/logger';
import domainRepository from '../../repositories/domain/domainRepository';
import authenticationService from '../../services/authenticationService';
import AuthenticationException from '../../errors/AuthenticationException';

const TAG = 'DomainController';
let schema;

class DomainController {
	constructor() {
		schema = configs.db.database;
		this.crudRepo = domainRepository;
		this.authenticationService = authenticationService;
		//logger.info(TAG, 'SET domainRepository as crudRepo' + JSON.stringify(domainRepository));
	}

	/* istanbul ignore next */
	getRouter() {
		let router = Router();
		//let checkAuth = this.authenticationService.checkAuth;

		router.get('/:domainPlural', this.findAllByQuery);
		router.post('/:domainPlural', this.createOne);
		router.get('/:domainPlural/:id', this.findOne);
		router.delete('/:domainPlural/:id', this.deleteOne);
		router.put('/:domainPlural/:id', this.updateOne);

		/*
		router.get('/:domainPlural/count', checkAuth, count);
		router.get('/:domainPlural', checkAuth, findAll);
		router.get('/:domainPlural/:id', checkAuth, findOne);
		router.post('/:domainPlural', checkAuth, createOne);
		router.delete('/:domainPlural/:id', checkAuth, deleteOne);
    	*/
		return router;
	}
	/**
	 * Find all entities of a certain domain (=tableName)
	 * Example curl command:
	 * curl -i -H "tenant-id:1" "http://localhost:3001/api/mediaFiles?filters=fileName.contains(1-94)&tenantId=2&prettyFormat"
	 */
	findAllByQuery = (req, res, next) => {
		let requestArgs = getAllRequestArguments(req);
		//logger.info(TAG, `args=` + stringify(requestArgs));

		this.crudRepo
			.findAllByQuery(requestArgs)
			.then(resultObject => {
				let responseBody = buildResponseObject(req, requestArgs, resultObject);
				responseBody.headers = req.headers;
				res.status(HttpStatusCodes.Ok)
					.type('json')
					.send(formatResponse(req, responseBody));
			})
			.catch(err => next(err));
	};
	/**
	 * Finds the one entity with the given id (after the domain parameter)
	 * Example curl query:
	 * curl -i -H "tenant-id:1" "http://localhost:3001/api/mediaFiles/2&prettyFormat"
	 */
	findOne = (req, res, next) => {
		let { domain, tenantId } = getAllRequestArguments(req);
		let id = req.params.id; // get additional parameter entity id
		this.crudRepo
			.findOne({ domain, tenantId, id })
			.then(resultObject => {
				if (resultObject.length === 0) {
					res.status(HttpStatusCodes.NotFound).send('Entity not found');
				} else {
					let responseBody = { item: resultObject };
					res.status(HttpStatusCodes.Ok)
						.type('json')
						.send(formatResponse(req, responseBody));
				}
			})
			.catch(err => next(err));
	};
	/**
	 * Creates a new object of the given type
	 * curl -i -H "tenant-id:1" "http://localhost:3001/api/mediaFiles/2&prettyFormat"
	 * curl -i -H "tenant-id:1" -d '{"fileName":"new file", "type":"doc"}' -H "Content-Type: application/json" -X POST http://localhost:3001/api/mediaFiles
	 */
	createOne = (req, res, next) => {
		let tenantId = getTenantId(req);
		let { domain } = getDomain(req);
		//logger.info(TAG, `Post '${domain}' object: ${stringifyNoWrap(req.body)}`);

		if (domain === configs.domain.userDomain) {
			logger.info(TAG, 'throw new AuthenticationException');
			throw new AuthenticationException(TAG, `Domain ${domain} object cannot be created.`);
		}

		this.crudRepo
			.createOne({ domain, tenantId, entity: req.body })
			.then(result => {
				res.status(HttpStatusCodes.Created)
					.type('json')
					.send({ created: result });
			})
			.catch(/* istanbul ignore next */ e => next(e));
	};

	/**
	 * Deletes one entity.
	 * Curl: curl -X DELETE http://localhost:3001/api/mediaFiles/2
	 */
	deleteOne = (req, res, next) => {
		let { domain } = getDomain(req);
		let tenantId = getTenantId(req);
		let id = req.params.id; // get additional parameter entity id
		if (domain === configs.domain.userDomain) {
			logger.info(TAG, 'throw new AuthenticationException');
			throw new AuthenticationException(TAG, `Domain ${domain} object cannot be created.`);
		}

		logger.info(TAG, `DELETE record with id ${id} from ${schema}.${domain}'`);

		this.crudRepo
			.deleteOne({ domain, tenantId, id })
			.then(result => {
				logger.info(TAG, `DELETE result:`, result);

				res.status(HttpStatusCodes.Ok)
					.type('json')
					.send({ message: `Deleted entity '${domain}' with id='${id}'` });
			})
			.catch(/* istanbul ignore next */ e => next(e));
	};

	/**
	 * Updates an existing object of the given type
	 * curl -i -H "tenant-id:1" -d '{"fileName":"new file", "type":"doc"}' -H "Content-Type: application/json" -X PUT http://localhost:3001/api/mediaFiles/1
	 */
	updateOne = (req, res, next) => {
		let { domain } = getDomain(req);
		let tenantId = getTenantId(req);
		let id = req.params.id; // get additional parameter entity id
		if (domain === configs.domain.userDomain) {
			logger.info(TAG, 'throw new AuthenticationException');
			throw new AuthenticationException(TAG, `Domain ${domain} object cannot be created.`);
		}
		logger.info(TAG, `Put '${domain}' object: ${stringifyNoWrap(req.body)}`);

		this.crudRepo
			.updateOne({
				domain,
				tenantId,
				entity: req.body,
				id,
			})
			.then(result => {
				res.status(HttpStatusCodes.Created)
					.type('json')
					.send({ created: result });
			})
			.catch(/* istanbul ignore next */ e => next(e));
	};

	count = (req, res, next) => {
		let { domain } = getDomain(req);
		let multiTenancyFilter = getMultiTenancyFilter(domain, req);

		let filters = getFilterArguments(req.query);

		this.crudRepo
			.count({ schema: schema, tableName: domain, multiTenancyFilter, filters })
			.then(result => {
				res.status(200)
					.type('json')
					.send(result);
			})
			.catch(/* istanbul ignore next */ e => next(e));
	};
}

let domainController = new DomainController();
export default domainController;
