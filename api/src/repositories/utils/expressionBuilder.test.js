import {
	buildFilterExpression,
	buildSingleFilter,
	buildSortExpression,
	buildSortExpressionFromMinusPlusNotation,
	buildSelectAttributesPart,
	buildPaginationParams,
} from './expressionBuilder';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
import configs from '../../config/configs';

describe('buildSortExpression', () => {
	test('should return empty string in case of no sort expressions', () => {
		expect(buildSortExpression(undefined)).toBe('');
	});

	test('should translate array to correct SQL order expression', () => {
		expect(buildSortExpression(['id desc', 'name desc'])).toBe('ORDER BY id desc,name desc');
	});

	test('should translate array to correct SQL order expression', () => {
		expect(buildSortExpression(['id asc', 'name desc'])).toBe('ORDER BY id asc,name desc');
	});
});

describe('buildSortExpressionFromMinusPlusNotation', () => {
	test('sort expression is derived correctly from minus plus notation', () => {
		expect(buildSortExpressionFromMinusPlusNotation(['+ name', '- firstName', 'address'])).toBe('ORDER BY name asc,firstName desc,address asc');
	});
	test('sort expression is derived correctly from minus plus notation in case no sort array is defined', () => {
		expect(buildSortExpressionFromMinusPlusNotation()).toBe('');
	});
});

describe('buildSingleFilter', () => {
	test(`should throw expection because no . in expression`, () => {
		expect(() => buildSingleFilter('name startsWith(reg)')).toThrow(IllegalArgumentException);
	});
	test(`should be "name LIKE 'reg%'"`, () => {
		expect(buildSingleFilter('name.startsWith(reg)')).toBe(`name LIKE 'reg%'`);
	});

	test(`should be "name = 'reg'"`, () => {
		expect(buildSingleFilter('name.eq(reg)')).toBe(`name = 'reg'`);
	});

	test(`should be "name like '%reg%'"`, () => {
		expect(buildSingleFilter('name.contains(reg)')).toBe(`name LIKE '%reg%'`);
	});

	test(`should be "id > '100'"`, () => {
		expect(buildSingleFilter('id.gt(100)')).toBe(`id > '100'`);
	});

	test(`should be "id >= '100'"`, () => {
		expect(buildSingleFilter('id.gte(100)')).toBe(`id >= '100'`);
	});

	test(`should be "id <= '100'"`, () => {
		expect(buildSingleFilter(`id.lt(100)`)).toBe(`id < '100'`);
	});

	test(`should be "id <= '100'"`, () => {
		expect(buildSingleFilter(`id.lte(100)`)).toBe(`id <= '100'`);
	});

	test('should throw IllegalArgumentException because of unsupported operation', () => {
		expect(() => buildSingleFilter(`id.unsupportedOps(100)`)).toThrow(IllegalArgumentException);
	});

	test(`should throw IllegalArgumentException because argument is not defined correctly`, () => {
		expect(() => {
			buildSingleFilter(`id.eq(100`);
		}).toThrow(IllegalArgumentException);
	});
});

describe('buildFilterExpression', () => {
	test('empty filters should result in empty string', () => {
		expect(buildFilterExpression()).toBe('');
		expect(buildFilterExpression([])).toBe('');
		expect(buildFilterExpression([], false)).toBe('');
		expect(buildFilterExpression([], true)).toBe('');
		expect(buildFilterExpression([], false, 10)).toBe('');
		expect(buildFilterExpression([], true, 10)).toBe("WHERE (tenant_id = '10')");
	});
	test('or combination on same column, and second filter on second column', () => {
		expect(buildFilterExpression(['name.startsWith(reg).OR.name.eq(test)', 'id.eq(100)'])).toBe(
			"WHERE (name LIKE 'reg%' OR name = 'test') AND (id = '100')"
		);
	});
	test('3 or columns and second filter on second column', () => {
		expect(buildFilterExpression(['name.startsWith(reg).OR.name.eq(test).OR.id.gt(2)', 'id.eq(100)'])).toBe(
			"WHERE (name LIKE 'reg%' OR name = 'test' OR id > '2') AND (id = '100')"
		);
	});

	test('if illegal manual filter for tenantId is removed and correct filter is added', () => {
		let isMultiTenant = true;
		let tenantId = 100;
		expect(
			buildFilterExpression([`name.startsWith(reg).OR.${configs.domain.tenantIdField}.eq(12).OR.id.gt(2)`, 'id.eq(100)'], isMultiTenant, tenantId)
		).toBe(`WHERE (id = '100') AND (${configs.domain.tenantIdField} = '${tenantId}')`);
	});
});

describe('buildSelectAttributesPart', () => {
	test('should assert only visible attributes will be listed as select ... part', () => {
		expect(buildSelectAttributesPart(['firstName', 'lastName', 'tenant_id'], ['firstName', 'lastName'])).toStrictEqual('firstName,lastName');
	});

	test('should assert all visible attributes will be listed as select ... part when no requested attributes are listed (that is * selection', () => {
		expect(buildSelectAttributesPart([], ['firstName', 'lastName'])).toStrictEqual('firstName,lastName');
	});
});

describe('buildPaginationParams', () => {
	test('should return pagination params', () => {
		expect(buildPaginationParams({ hasPagination: true, pageNum: 2, pageSize: 20 })).toStrictEqual({ offset: 40, pageSize: 20 });
		expect(buildPaginationParams({ hasPagination: false, pageNum: 20, pageSize: 2 })).toStrictEqual({
			pageSize: 1000000,
			offset: 0,
		});
	});
});
