/* istanbul ignore file */
import mariadb from 'mariadb';
import SqlException from '../errors/SqlException';
import logger from '../utils/logger/logger';
import { stringifyNoWrap } from '../utils/utils';
import configs from '../config/configs';

const TAG = 'mariaDb.js';

// --------------------------------------------------------------------------------------------
// private functions
// --------------------------------------------------------------------------------------------
function validateArgs(stmt, args) {
	if (typeof stmt !== 'string') {
		throw new SqlException(TAG + ' executeNamedPlaceholdersStmt', `executeNamedPlaceholdersStmt failed because stmt ${stmt} is not of type 'string'`);
	}
	if (typeof args !== 'object') {
		throw new SqlException(TAG + ' executeNamedPlaceholdersStmt', `executeNamedPlaceholdersStmt failed because args are not of type 'object'`);
	}
}

/**
 * Create the database connection pool
 */
function createPool() {
	let d = configs.db;
	let dbPool = mariadb.createPool({
		host: d.host,
		user: d.user,
		port: d.port,
		password: d.password,
		database: d.database,
		connectionLimit: 5,
		timeout: 2,
		multipleStatements: true,
	});

	logger.info(TAG, `DB connection pool created for ${d.host}:${d.port} ${d.database}`);
	return dbPool;
}

// --------------------------------------------------------------------------------------------
// public functions
// --------------------------------------------------------------------------------------------
class MariaDbAdaptor {
	constructor() {
		// Lazy creation of pool, that is only at the time of usage. Necessary for testing as this instance is injected but while testing overriden
		// This avoids connection exceptions as unit tests should not depend on a running database
		this.dbPool;
	}
	getPool() {
		if (!this.dbPool) {
			this.dbPool = createPool();
		}
		return this.dbPool;
	}
	// Retrieve a connection from the database pool
	getConnection() {
		if (!this.dbPool) createPool();
		return this.dbPool.getConnection();
	}

	/**
	 * Executes an Sql statement with ? placeholders, whose values are listed in argList. The function returns a promise
	 * @param stmt Sql statement with named placeholders, eg. :paramName
	 * @param argList argument list to be put into placeholders
	 * @returns {Promise<any>}
	 */
	executeStmt = (stmt, argList) => this.getPool().query(stmt, argList);

	/**
	 * Executes an Sql statement with named placeholders (:paramName), whose values are handed over within the args object. The function returns a promise
	 * @param stmt Sql statement with named placeholders, eg. :paramName
	 * @param args argument object whose properties must match the named placeholders
	 * @returns {Promise<any>}
	 */
	executeNamedPlaceholdersStmt = (stmt, args) => {
		validateArgs(stmt, args);

		logger.info(`${TAG}:execNamedPlhStmt`, `${stmt}`);
		logger.info(`${TAG}:execNamedPlhStmt`, `Values ${stringifyNoWrap(args)}`);
		return this.getPool().query({ namedPlaceholders: true, sql: stmt }, args);
	};
}

const mariaDbAdaptor = new MariaDbAdaptor();
export default mariaDbAdaptor;
