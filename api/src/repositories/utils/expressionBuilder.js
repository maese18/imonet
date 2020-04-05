import IllegalArgumentException from '../../errors/IllegalArgumentException';
import configs from '../../config/configs';
import { orDefaultNumber } from '../../utils/utils';
const TAG = 'ExpressionBuilder';

export const buildSortExpression = (sortArray = []) => {
	let expression = sortArray.join(',');
	return expression.length > 0 ? `ORDER BY ${expression}` : '';
};

export const buildSortExpressionFromMinusPlusNotation = (sortArray = []) => {
	let expression = sortArray
		.map(s => s.trim())
		.filter(s => s !== '')
		.map(s => {
			if (s.startsWith('+')) {
				return `${s.substr(1).trim()} asc`;
			} else if (s.startsWith('-')) {
				return `${s.substr(1).trim()} desc`;
			}
			return `${s} asc`;
		});
	return expression.length > 0 ? `ORDER BY ${expression}` : '';
};
const OPS = {
	startsWith: (col, arg) => `${col} LIKE '${arg}%'`,
	contains: (col, arg) => `${col} LIKE '%${arg}%'`,
	eq: (col, arg) => `${col} = '${arg}'`,
	gt: (col, arg) => `${col} > '${arg}'`,
	gte: (col, arg) => `${col} >= '${arg}'`,
	lt: (col, arg) => `${col} < '${arg}'`,
	lte: (col, arg) => `${col} <= '${arg}'`,
};
export const buildSingleFilter = filter => {
	let firstDot = filter.indexOf('.');
	if (firstDot < 0) {
		throw new IllegalArgumentException(TAG, `Illegal filter expression ${filter}`);
	}

	let column = filter.substring(0, firstDot);
	let opsAndArg = filter.substring(firstDot + 1);
	let openInd = opsAndArg.indexOf('(');
	let closeInd = opsAndArg.indexOf(')');
	if (openInd < 1 || closeInd < 3) throw new IllegalArgumentException(TAG, `No argument defined for filter '${filter}' in ${opsAndArg}`);
	let op = opsAndArg.substr(0, openInd);
	let arg = opsAndArg.substr(openInd + 1, closeInd - openInd - 1);

	let builder = OPS[op];
	if (!builder) {
		throw new IllegalArgumentException(TAG, `No operation defined for ${op}`);
	}
	return builder(column, arg);
};

const buildFiltersSegment = filter => {
	let orFilters = filter
		.split('.OR.')
		.map(f => buildSingleFilter(f))
		.join(' OR ');
	/* istanbul ignore next */
	return orFilters.length === 0 ? '' : `(${orFilters})`;
};

/* istanbul ignore next */
const buildSimpleFilterExpression = (filters = []) => {
	const filterCopy = filters.map(f =>
		f
			.split("'")
			.join('')
			.split('"')
			.join('')
	); //escaping

	let expr = filterCopy.map(filter => buildFiltersSegment(filter)).join(' AND ');
	return expr.length === 0 ? '' : `WHERE ${expr}`;
};

export const buildFilterExpression = (filters = [], isMultiTenantDomain = true, tenantId) => {
	let filtersCopy;
	if (isMultiTenantDomain && tenantId) {
		// Remove illegal filtering by tenantIdField, that is the whole expression is removed (means that an OR connection is completely removed)
		filtersCopy = filters.filter(f => f.indexOf(configs.domain.tenantIdField) < 0);
		// Add filter for tenantIdField explicitely
		filtersCopy.push(`${configs.domain.tenantIdField}.eq(${tenantId})`);
	} else {
		filtersCopy = [...filters];
	}
	let filterExpression = buildSimpleFilterExpression(filtersCopy);
	return filterExpression;
};

/**
 * Build the select attributes part of the statement.
 * @param {*} requestedAttributes
 * @param {*} visibleAttributes
 */
export const buildSelectAttributesPart = (requestedAttributes, visibleAttributes) => {
	let verifiedAttributes = requestedAttributes.length === 0 ? visibleAttributes : requestedAttributes.filter(a => visibleAttributes.indexOf(a) >= 0);
	let attributesPart = verifiedAttributes.join(',');
	return verifiedAttributes.length === 0 ? '*' : attributesPart;
};

export const buildPaginationParams = paginationArgs => {
	let { pageNum, pageSize, hasPagination } = paginationArgs;
	let validatedPageSize = orDefaultNumber(pageSize, configs.api.defaults.pageSize);
	let validatedOffset = orDefaultNumber(pageNum, 0) * validatedPageSize;

	return hasPagination
		? {
				pageSize: validatedPageSize,
				offset: validatedOffset,
		  }
		: {
				pageSize: 1000000,
				offset: 0,
		  };
};
export default {};
