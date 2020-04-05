import fs from 'fs';
import configs from '../config/configs';
import logger from '../utils/logger/logger';
import { sleep } from '../utils/utils';
import mariaDbAdaptor from './mariaDbAdaptor';
import path from 'path';
import SqlException from '../errors/SqlException';
const TAG = 'MigrationController';

function getMigrationFileNamesByModeSync(mode) {
	return fs
		.readdirSync(path.join(__dirname, '../../migrations/sqls'))
		.filter(file => file.indexOf(mode) >= 0)
		.sort((f1, f2) => {
			let n1 = Number(f1.split('_')[0]);
			let n2 = Number(f2.split('_')[0]);
			return mode === 'up' ? n1 - n2 : n2 - n1;
		});
}
async function runSqlScriptWithRetry(pool, filePath) {
	const MAX_RETRIES = 3;
	let stmt = fs.readFileSync(filePath, 'utf8');

	for (let i = 0; i <= MAX_RETRIES; i++) {
		try {
			let result = await pool.query(stmt);
			logger.info(TAG, `Run sql script ${filePath} successfully`);
			return result;
		} catch (err) {
			const timeout = Math.pow(2, 8 + i);
			logger.info(TAG, `Waiting ${timeout}ms`);
			await sleep(timeout);
			logger.info(TAG, `Retry no. ${i} ${err.message}`);
		}
	}
}
class MigrationController {
	constructor() {
		this.db = mariaDbAdaptor;
	}

	awaitConnectionAndGetMigrations = async pool => {
		let retries = 5;
		let retryNo = 0;
		let thisErr = {};
		do {
			try {
				let migrations = await pool.query('SELECT * FROM _migrations ORDER BY executionDateTime');
				logger.info(TAG, `Got migrations from Database ${JSON.stringify(migrations)}`);
				return migrations;
			} catch (err) {
				if (err.code === 'ER_GET_CONNECTION_TIMEOUT' || err.code === 'ECONNREFUSED') {
					logger.info(TAG, 'Awaiting DB connection');
					thisErr = err;
				} else {
					try {
						await runSqlScriptWithRetry(pool, path.join(__dirname, '../../migrations', 'migrationTable.sql'));
						logger.info(TAG, 'Migrations Table created');

						let result = await pool.query('SELECT * FROM _migrations ORDER BY executionDateTime');
						return result;
					} catch (queryErr) {
						throw { message: 'Failed to query for migrations ', source: queryErr };
					}
				}
			}
			retryNo++;
		} while (thisErr.code === 'ER_GET_CONNECTION_TIMEOUT' && retryNo < retries);

		throw new SqlException(TAG, `Failed to get db connection after ${retryNo}`);
	};

	async runMigrationStep(pool, fileName, mode) {
		try {
			let filePath = path.join(__dirname, '../../migrations/sqls', fileName);
			let sqlScriptStatements = fs.readFileSync(filePath, 'utf8');
			let migrationsWithGivenName = await pool.query('SELECT * FROM _migrations WHERE file = ?', [fileName]);
			let migrationExists = migrationsWithGivenName.length > 0;
			let baseMsg = `Migrations entry <${fileName}> exists? `;
			if (mode === 'up') {
				if (migrationExists) {
					logger.info(TAG, `${baseMsg} yes => do nothing.`);
				} else {
					let number = Number(fileName.split('_')[0]);
					try {
						let migrationQueryResult = await pool.query(sqlScriptStatements);
						let migrationProtocolResult = await pool.query('INSERT INTO _migrations (file,number) VALUES (?,?)', [fileName, number]);
						logger.info(TAG, `${baseMsg} no => executed script ${fileName}`);
					} catch (err) {
						logger.error(TAG, 'Migration step failed', err);
						throw err;
					}
				}
			} else {
				logger.info(TAG, baseMsg + (migrationExists ? 'Yes => execute down script ' + fileName + ' and remove migrations entry' : 'No => do nothing'));
				if (migrationExists) {
					await pool.query(sqlScriptStatements);
					await pool.query(`DELETE FROM _migrations WHERE file = ?`, [migrationScriptFileName]);
					logger.info(TAG, `Run migration script ${fileName} and deleted migration entry with file=${fileName}}`);
				}
			}
		} catch (ex) {
			console.log('Failed to execute stmt', ex);
		}
	}
	async runDbMigrations() {
		let mode = configs.db.migrationsMode;
		try {
			let pool = this.db.getPool();

			let migrations = await this.awaitConnectionAndGetMigrations(pool);
			logger.info(TAG, 'Existing migration records:/n' + JSON.stringify(migrations, null, 2));
			logger.info(TAG, 'Successfully established DB connection ');
			logger.info(TAG, `Running migrations in <${mode}> mode. `);

			let migrationFileNames = getMigrationFileNamesByModeSync(mode);

			for (let i = 0; i < migrationFileNames.length; i++) {
				let fileName = migrationFileNames[i];
				await this.runMigrationStep(pool, fileName, mode);
			}
			return 'Migrations completed';
		} catch (ex) {
			logger.error(TAG, 'Finally failed to get db connection', ex);
			throw ex;
		}
	}
}
let migrationController = new MigrationController();
export default migrationController;
