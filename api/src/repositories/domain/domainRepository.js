import logger from '../../utils/logger/logger';
import {
	buildFilterExpression,
	buildSortExpression,
	buildSortExpressionFromMinusPlusNotation,
	buildSelectAttributesPart,
	buildPaginationParams,
} from '../utils/expressionBuilder';
import { stringify, stringifyNoWrap, orDefault } from '../../utils/utils';
import repositoryUtil from '../utils/repositoryUtil';
import configs from '../../config/configs';
import AuthorizationException from '../../errors/AuthorizationException';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
import mariaDb from '../../database/mariaDbAdaptor';
//import mysql from '../../database/mySqlDbAdaptor';
import domainTypeService from '../../services/DomainTypeService';

const TAG = 'DomainRepository';
let db;
let configService;
function checkMultiTenancy(isMultiTenantDomain, tenantId, reject) {
	if (isMultiTenantDomain && !tenantId) {
		reject(
			new IllegalArgumentException(
				TAG,
				'No tenantId is defined. Must be provided within JWT token or as fallbacks in header tenant-id or as final fallback in query parameter tenantId'
			)
		);
		return false;
	}
	return true;
}

function checkDomain(_domainTypeService, domain, reject) {
	if (!_domainTypeService.isRegisteredDomain(domain)) {
		throw new AuthorizationException(TAG, `Operation failed on table ${domain} because this is an unknown domain.`);
	}
}

class DomainRepository {
	constructor() {
		this.dbAdaptor = mariaDb;
		this.schema = configs.db.database;
		this.repositoryUtil = repositoryUtil;
	}

	findAllByQuery = ({ domain, tenantId, multiTenancyFilter, attributes = [], paginationArgs = {}, sort = [], filters = [] }) => {
		let schema = this.schema;
		return new Promise((resolve, reject) => {
			if (!domainTypeService.isRegisteredDomain(domain)) {
				reject(new AuthorizationException(TAG, `Failed to retrieve items from ${domain} because this is an unknown domain.`));
			} else {
				let isMultiTenantDomain = domainTypeService.isMultiTenantDomain(domain);
				let sortExpression = buildSortExpressionFromMinusPlusNotation(sort);
				let filterExpression = buildFilterExpression(filters, isMultiTenantDomain, tenantId);
				let requestedAttributes = attributes;

				logger.debug(TAG, `tenantId=${tenantId}`);
				logger.debug(TAG, `isMultiTenantDomain=${isMultiTenantDomain}`);
				logger.debug(TAG, `filterExpression=${filterExpression}`);
				logger.debug(TAG, `sort=${stringifyNoWrap(sort)}`);
				logger.debug(TAG, `sortExpression=${sortExpression}`);

				if (!checkMultiTenancy(isMultiTenantDomain, tenantId, reject)) return;

				this.repositoryUtil
					.getAllTableColumnsExceptTenantId(schema, domain, isMultiTenantDomain)
					.then(visibleAttributes => {
						let attributesString = buildSelectAttributesPart(requestedAttributes, visibleAttributes);

						let query = `SELECT ${attributesString} FROM ${schema}.${domain} ${filterExpression} ${sortExpression} LIMIT :pageSize OFFSET :offset`;
						let needCount = orDefault(paginationArgs.hasPagination, false);
						let countStatement = `SELECT COUNT(*) as count FROM ${schema}.${domain} ${filterExpression}`;

						let countPromise = this.repositoryUtil.executeGetCountConditionally(needCount, countStatement);

						let namedQueryParameters = buildPaginationParams(paginationArgs);
						logger.info(TAG, `Execute statement ${query}`);
						let queryPromise = this.dbAdaptor.executeNamedPlaceholdersStmt(query, namedQueryParameters);

						// Return Promise whose then is called when both promises resolve.
						Promise.all([countPromise, queryPromise])
							.then(([countResult, queryResult]) => {
								let responseObject = {
									totalItemsCount: needCount ? countResult[0].count : queryResult.length,
									verifiedAttributes: attributesString,
									data: queryResult,
								};
								resolve(responseObject);
							})

							.catch(/* istanbul ignore next */ err => reject(err));
					})
					.catch(/* istanbul ignore next */ err => reject(err));
			}
		});
	};
	findOne = ({ domain, tenantId, id }) => {
		try {
			checkDomain(domainTypeService, domain);
			let isMultiTenantDomain = domainTypeService.isMultiTenantDomain(domain);
			let filters = [`id.eq(${id})`];
			let filterExpression = buildFilterExpression(filters, isMultiTenantDomain, tenantId);

			logger.info(TAG, 'findOne');
			return this.dbAdaptor.getPool().query(`SELECT * FROM ${this.schema}.${domain} ${filterExpression}`, []);
		} catch (e) {
			return Promise.reject(e);
		}
	};

	createOne = ({ domain, tenantId, entity }) => {
		try {
			checkDomain(domainTypeService, domain);
			return new Promise(async (resolve, reject) => {
				let isMultiTenantDom = domainTypeService.isMultiTenantDomain(domain);
				let columnsExceptTenantId = await this.repositoryUtil.getAllTableColumnsExceptTenantId(this.schema, domain, isMultiTenantDom);
				let validAttributesInEntity = Object.keys(entity).filter(k => k !== 'id' && columnsExceptTenantId.indexOf(k) >= 0);
				//logger.info(TAG, `columnsExceptTenantId: ${columnsExceptTenantId} `);
				//logger.info(TAG, `Entity keys: ${Object.keys(entity)} => whereas valid column names are: ${validAttributesInEntity}`);

				let insertAttributes = validAttributesInEntity.map(k => '`' + k + '`');
				let valuesPlaceholder = validAttributesInEntity.map(() => '?');
				let values = validAttributesInEntity.map(k => entity[k]);

				if (isMultiTenantDom) {
					insertAttributes.push('`' + configs.domain.tenantIdField + '`'); //usually client_id
					valuesPlaceholder.push('?');
					values.push(tenantId);
				}

				let sql = `INSERT INTO ${this.schema}.${domain} (${insertAttributes.join(',')}) VALUES (${valuesPlaceholder.join(',')})`;
				this.dbAdaptor
					.executeStmt(sql, values)
					.then(insertResponse => {
						const createdExposableEntity = {};
						validAttributesInEntity.forEach(k => (createdExposableEntity[k] = entity[k]));
						createdExposableEntity.id = insertResponse.insertId; // Add created id
						resolve(createdExposableEntity);
					})
					.catch(err => reject(err));
			});
		} catch (e) {
			return Promise.reject(e);
		}
	};

	deleteOne = ({ domain, tenantId, id }) => {
		checkDomain(domainTypeService, domain);
		return new Promise((resolve, reject) => {
			let isMultiTenantDomain = domainTypeService.isMultiTenantDomain(domain);
			let filters = [`id.eq(${id})`];
			let filterExpression = buildFilterExpression(filters, isMultiTenantDomain, tenantId);

			this.dbAdaptor
				.getPool()
				.query(`DELETE FROM ${this.schema}.${domain} ${filterExpression}`, [])
				.then(result => {
					console.log('DELETE_ONE', result);
					if (result.affectedRows > 0) {
						resolve(result);
					}
					reject(new IllegalArgumentException(TAG, `No entity with id ${id}`));
				})
				.catch(err => reject(err));
		});
	};

	updateOne({ domain, tenantId, entity, id }) {
		let entityId = id;
		let tableName = domain;
		let schema = this.schema;
		checkDomain(domainTypeService, domain);

		return new Promise(async (resolve, reject) => {
			let isMultiTenantDom = domainTypeService.isMultiTenantDomain(tableName);
			let columnsExceptTenantId = await this.repositoryUtil.getAllTableColumnsExceptTenantId(schema, tableName, isMultiTenantDom);
			let validAttributesInEntity = Object.keys(entity).filter(k => k !== 'id' && columnsExceptTenantId.indexOf(k) >= 0);
			logger.debug(TAG, `Entity keys: ${Object.keys(entity)} => whereas valid column names are: ${validAttributesInEntity}`);

			let setAttributeAndValueParts = validAttributesInEntity.map(k => `${k}=?`);
			let values = validAttributesInEntity.map(k => entity[k]);
			let wheres = [`id=${entityId}`];
			if (isMultiTenantDom) {
				setAttributeAndValueParts.push(`${configs.domain.tenantIdField}=?`); //usually client_id
				values.push(tenantId);
				wheres.push(`${configs.domain.tenantIdField}=${tenantId}`);
			}
			let setExpression = setAttributeAndValueParts.length > 0 ? 'SET ' + setAttributeAndValueParts.join(',') : '';
			let updateSql = `UPDATE ${schema}.${tableName} ${setExpression} WHERE (${wheres.join(' AND ')})`;
			logger.info(TAG, `UpdateSql=${updateSql}`);
			this.dbAdaptor
				.getPool()
				.query(updateSql, values)
				.then(updateResponse => {
					logger.debug(`${TAG}.updateOne`, `Update response: ${stringifyNoWrap(updateResponse)}`);
					if (updateResponse.affectedRows === 0) {
						reject(new IllegalArgumentException(TAG, `Update failed. Cause: no entity with id=${entityId}`));
					}
					const updatedExposableEntity = {};
					validAttributesInEntity.forEach(k => {
						updatedExposableEntity[k] = entity[k];
					});
					updatedExposableEntity.id = entityId;
					resolve(updatedExposableEntity);
				})
				.catch(err => reject(err));
		});
	}

	count = ({ schema, tableName, multiTenancyFilter = 'client_id.eq(-1)', filters = [] }) => {
		let filterExpression = buildFilterExpression(filters, multiTenancyFilter);
		return new Promise((resolve, reject) => {
			const queryCount = `SELECT COUNT(*) as count FROM ${schema}.${tableName} ${filterExpression}`;
			db.executeStmt(queryCount)
				.then(result => {
					logger.info(TAG, `${queryCount} result=${JSON.stringify(result, null, 2)}`);
					resolve(result[0]);
				})
				.catch(/* istanbul ignore next */ err => reject(err));
		});
	};
}
const domainRepository = new DomainRepository();
export default domainRepository;
