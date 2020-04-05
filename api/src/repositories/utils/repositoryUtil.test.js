import repositoryUtil from './repositoryUtil';
import configs from '../../config/configs';
const schema = 'anySchema';
const tableName = 'anyTableName';
let query = jest.fn(sql => {
	return new Promise(resolve => {
		if (sql === `SHOW Columns from ${schema}.${tableName}`) {
			let mockFields = [{ Field: 'fileName' }, { Field: 'id' }, { Field: configs.domain.tenantIdField }, { Field: 'type' }];
			resolve(mockFields);
		} else {
			resolve({ count: 2 });
		}
	});
});
const mockDb = {
	executeStmt: query,
	getPool() {
		return {
			query: query,
		};
	},
};
repositoryUtil.db = mockDb;

describe('repositoryUtil', () => {
	test('cached fields', async done => {
		let isMultiTenantTable = true;
		let attributes = await repositoryUtil.getAllTableColumnsExceptTenantId(schema, tableName, isMultiTenantTable);
		expect(attributes).toStrictEqual(['fileName', 'id', 'type']);

		//make sure the cache is hit and reported in test coverage
		attributes = await repositoryUtil.getAllTableColumnsExceptTenantId(schema, tableName, isMultiTenantTable);
		expect(attributes).toStrictEqual(['fileName', 'id', 'type']);
		done();
	});
	test('getAllTableColumnsExceptTenantId with multi tenant table when tenant id=tenant_id is not listed', async done => {
		let isMultiTenantTable = true;
		let attributes = await repositoryUtil.getAllTableColumnsExceptTenantId(schema, tableName, isMultiTenantTable);
		expect(attributes).toStrictEqual(['fileName', 'id', 'type']);

		done();
	});
	test('getAllTableColumnsExceptTenantId with common table should list all attributes', async done => {
		let isMultiTenantTable = false;
		let attributes = await repositoryUtil.getAllTableColumnsExceptTenantId(schema, tableName, isMultiTenantTable);
		expect(attributes).toStrictEqual(['fileName', 'id', 'tenant_id', 'type']);

		done();
	});

	test('executeGetCountConditionally', done => {
		let needCount = true;
		repositoryUtil.executeGetCountConditionally(needCount, '').then(result => {
			expect(result).toBeDefined();
			done();
		});

		needCount = false;
		repositoryUtil.executeGetCountConditionally(needCount, '').then(result => {
			expect(result).toStrictEqual({ count: -1 });
			done();
		});
	});
});
