/* istanbul ignore file */
import mysql from 'mysql';
import SqlException from '../errors/SqlException';
import logger from '../utils/logger/logger';
import { stringifyNoWrap } from '../utils/utils';
import configs from '../config/configs';

const TAG = 'mysql.js';

let dbPool;

// --------------------------------------------------------------------------------------------
// private functions
// --------------------------------------------------------------------------------------------
const getConnection = () => {
	if (!dbPool) createPool();
	return new Promise((resolve, reject) => {
		dbPool.getConnection((err, conn) => {
			if (err) {
				reject(err);
			} else {
				resolve(conn);
			}
		});
	});
};
const validateArgs = (stmt, args) => {
	if (typeof stmt !== 'string') {
		throw new SqlException(TAG + ' executeNamedPlaceholdersStmt', `executeNamedPlaceholdersStmt failed because stmt ${stmt} is not of type 'string'`);
	}
	if (typeof args !== 'object') {
		throw new SqlException(TAG + ' executeNamedPlaceholdersStmt', `executeNamedPlaceholdersStmt failed because args are not of type 'object'`);
	}
};
// Create the database connection pool
const createPool = () => {
	if (!dbPool) {
		let d = configs.db;
		dbPool = mysql.createPool({
			host: d.host,
			user: d.user,
			port: d.port,
			password: d.password,
			database: d.database,
			connectionLimit: 5,
		});

		logger.info(TAG, `DB connection pool created for ${d.host}:${d.port} ${d.database}`);
	}
};
const execStmt = (conn, stmt, args, resolve, reject) =>
	conn
		.query(stmt, args)
		.then(result => resolve(result))
		.catch(e => reject(e))
		.finally(() => {
			conn.release();
		});

const execNamedPlhStmt = (conn, stmt, args, resolve, reject) =>
	conn
		.query({ namedPlaceholders: true, sql: stmt }, args)
		.then(result => resolve(result))
		.catch(e => reject(e))
		.finally(() => {
			conn.release();
		});

// --------------------------------------------------------------------------------------------
// public functions
// --------------------------------------------------------------------------------------------
class MySql {
	// Retrieve a connection from the database pool
	getConnection = getConnection;

	/**
	 * Executes an Sql statement with ? placeholders, whose values are listed in argList. The function returns a promise
	 * @param stmt Sql statement with named placeholders, eg. :paramName
	 * @param argList argument list to be put into placeholders
	 * @returns {Promise<any>}
	 */
	executeStmt = (stmt, argList) =>
		new Promise((resolve, reject) => {
			getConnection()
				.then(conn => execStmt(conn, stmt, argList, resolve, reject))
				.catch(e => reject(e));
		});

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

		return new Promise((resolve, reject) => {
			getConnection()
				.then(conn => execNamedPlhStmt(conn, stmt, args, resolve, reject))
				.catch(e => reject(e));
		});
	};
}

const mySqlDbAdaptor = new MySql();
export default mySqlDbAdaptor;
