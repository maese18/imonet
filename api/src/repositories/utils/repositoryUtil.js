import configs from '../../config/configs';
import mariaDb from '../../database/mariaDbAdaptor';
import logger from '../../utils/logger/logger';

const tableColumnsCache = {};
const TAG = 'RepositoryUtil';
class RepositoryUtil {
	constructor() {
		this.db = mariaDb;
	}

	/**
	 * Returns a Promise which resolves immediately in case no count is needed and otherwise resolves with the count after
	 * the count statement has been executed.
	 */
	executeGetCountConditionally(needCount, countStatement) {
		if (needCount) {
			logger.info(TAG, `Execute count statement ${countStatement}`);
			return this.db.getPool().query(countStatement);
		}
		return Promise.resolve({ count: -1 });
	}

	getAllTableColumnsExceptTenantId = (schema, tableName, isMultiTenantTable) => {
		return new Promise(resolve => {
			let tableIdentifier = `${schema}.${tableName}s`;
			let cacheIdentifier = `${isMultiTenantTable}:${tableIdentifier}`;
			let cachedAttributes = tableColumnsCache[cacheIdentifier];
			if (cachedAttributes) {
				resolve(cachedAttributes);
			}
			let metaSql = `SHOW Columns from ${tableIdentifier}`;
			this.db
				.getPool()
				.query(metaSql)
				.then(fields => {
					let columnNames = fields
						.map(f => f.Field)
						.filter(f => {
							if (!isMultiTenantTable) {
								return true;
							}
							// Remove password column
							if (tableName === configs.domain.userDomain && f.indexOf('password') >= 0) {
								return false;
							}
							return f !== configs.domain.tenantIdField;
						});
					tableColumnsCache[cacheIdentifier] = columnNames;
					resolve(columnNames);
				})
				.catch(
					/*istanbul ignore next */ e => {
						console.log(e);
						// Recover here by returning an empty column list
						resolve([]);
					}
				);
		});
	};
}
const repositoryUtil = new RepositoryUtil();
export default repositoryUtil;
