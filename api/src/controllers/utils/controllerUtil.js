import { orDefaultNumber } from '../../utils/utils';
import configs from '../../config/configs';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
import domainTypeService from '../../services/domainTypeService';

const TAG = 'controllerUtil';

/**
 * Retrieves paging and sorting parameters from the given http request, resp. the associated query string.
 * @param query HTTP request query params
 * @returns {{pageSize: *, sort: *, pageNum: *}}
 */
export function getPaginationArguments(query) {
	let hasPagination = !!(query.pageSize || query.pageNum);
	if (!hasPagination) return { hasPagination };
	return {
		hasPagination: hasPagination,
		pageNum: orDefaultNumber(query.pageNum, 0),
		pageSize: orDefaultNumber(query.pageSize, configs.api.defaults.pageSize),
	};
}

/**
 * Get sort arguments from the query object sort attribute.
 * Sort arguments must be a comma separated list of attribute names, whereas ascending and descending is indicated
 * by a leading +, - or nothing (meaning +).
 * @param query HTTP request query params
 * @returns [sortArgs]]
 */
export function getSortArgs(query) {
	if (!query.sort) return [];
	let sortArgs = query.sort
		.split(',')

		.map(a => a.trim())
		.filter(a => a !== '');

	return sortArgs;
}

/**
 * Returns the requested attributes, e.g. table columnes.
 * These attributes need to be a comma-separated list of attribute names.
 * @param query HTTP request query params
 * @returns [requested attributes list]
 */
export function getRequestedAttributes(query) {
	if (!query.attributes) return [];

	return query.attributes.split(',').map(a => a.trim());
}

/**
 * Retrieves the domain from the request path parameter /:domainPlural, that is the
 * the domain is derived from its plural form.
 * @param req
 * @returns {{domain: *, domainPlural: *}}
 */
export function getDomain(req) {
	let domainPlural = req.params.domainPlural;
	if (!domainPlural) {
		throw new IllegalArgumentException(TAG, `No domain identified`);
	}
	let domain = domainPlural.substr(0, domainPlural.length - 1);
	return { domainPlural, domain };
}

/**
 * Retrieves paging and sorting parameters from the given http request, resp. the associated query string.
 * @param query HTTP request query
 * @returns {{pageSize: *, sort: *, pageNum: *}}
 */
export function getFilterArguments(query = {}) {
	return query.filters ? query.filters.split(',') : [];
}

/**
 * Retrieves the tenant id - either from request.decodedToken or from the header 'tenant-id'.
 * @param {*} req
 */
export function getTenantId(req) {
	let tenantId = req.decodedToken ? req.decodedToken.client_id : req.headers['tenant-id'] ? req.headers['tenant-id'] : req.query.tenantId;
	return tenantId;
}

export function getMultiTenancyFilter(domain, req) {
	let isCommonDomain = domainTypeService.isCommonDomain(domain);
	let isMultiTenantDomain = domainTypeService.isMultiTenantDomain(domain);
	if (!(isCommonDomain || isMultiTenantDomain)) {
		throw new IllegalArgumentException(TAG, `Domain '${domain}' cannot be processed.'`);
	}
	let clientId = getTenantId(req);
	return isMultiTenantDomain ? `client_id.eq(${clientId})` : false;
}

export function getAllRequestArguments(req) {
	let query = req.query ? req.query : {};
	let attributes = getRequestedAttributes(query);
	let paginationArgs = getPaginationArguments(query);
	let sort = getSortArgs(query);
	let filters = getFilterArguments(query);

	let tenantId = getTenantId(req);
	let { domain, domainPlural } = getDomain(req);
	let multiTenancyFilter = getMultiTenancyFilter(domain, req);
	return { domain, domainPlural, tenantId, multiTenancyFilter, attributes, paginationArgs, sort, filters };
}

/**
 * Prepares a response object containing properties for pageNum,pageSize,sortString,totalItems,status,self,first,last,next,previous

 * @param domainPlural
 * @param attributes
 * @param searchPath
 * @param totalItemsCount
 * @returns {*}
 */
export function buildResponseObject(req, requestArgs, resultObject) {
	let { domainPlural, attributes = [], filters = [], paginationArgs = {}, sort = [] } = requestArgs;
	let host = req.headers['host'];
	let { totalItemsCount, data } = resultObject;

	let response = {};
	response.query = req.query;

	response.data = data;

	let pagination = {
		totalItems: totalItemsCount,
		pageNum: paginationArgs.pageNum,
		pageSize: paginationArgs.pageSize,
	};
	if (paginationArgs.hasPagination) {
		response.pagination = pagination;
	}
	let filterString = filters.join(',');
	let { pageNum, pageSize } = paginationArgs;

	let totalPages = (totalItemsCount - (totalItemsCount % pageSize)) / pageSize;
	let server = configs.server;
	let parts = [];
	if (attributes.length > 0) {
		parts.push('attributes=' + attributes.join(','));
	}
	/* istanbul ignore next */
	if (filterString && filterString !== '') parts.push('filters=' + filterString);

	if (sort.length > 0) {
		parts.push('sort=' + sort.join(','));
	}

	let baseUrl = `/${configs.api.basePath}/${domainPlural}`;
	/*	host !== undefined
			? `${server.protocol}://${server.host}:${server.port}/${configs.api.basePath}/${domainPlural}`
			: `${server.protocol}://${host}/${configs.api.basePath}/${domainPlural}`;*/
	if (paginationArgs.hasPagination) {
		response.self = [baseUrl, [...parts, `pageNum=${pageNum}`, `pageSize=${pageSize}`].join('&')].filter(Boolean).join('?');
	} else {
		response.self = [baseUrl, parts.join('&')].filter(Boolean).join('?'); //filter out empty elements
	}
	pagination.first = [baseUrl, [...parts, `pageNum=0`, `pageSize=${pageSize}`].join('&')].filter(Boolean).join('?');
	pagination.last = [baseUrl, [...parts, `pageNum=${Math.max(0, totalPages - 1)}`, `pageSize=${pageSize}`].join('&')].filter(Boolean).join('?');

	if (pageNum > 0) {
		pagination.previous = [baseUrl, [...parts, `pageNum=${pageNum - 1}`, `pageSize=${pageSize}`].join('&')].filter(Boolean).join('?');
	}

	if (pageNum < totalPages) {
		pagination.next = [baseUrl, [...parts, `pageNum=${pageNum + 1}`, `pageSize=${pageSize}`].join('&')].filter(Boolean).join('?');
	}

	return response;
}

/**
 * Format response object in case the query parameter prettyFormat is set (or =true)
 * @param {*} req
 * @param {*} responseObject
 */
export const formatResponse = (req, responseObject) => {
	let prettyFormat = req.query && (req.query.prettyFormat === '' || req.query.prettyFormat === 'true');
	return prettyFormat ? JSON.stringify(responseObject, null, 2) : responseObject;
};
