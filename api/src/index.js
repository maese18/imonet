'use strict';
import configs from './config/configs';
import logger from './utils/logger/logger';
import app from './app';
import socket from 'socket.io';
import migrationController from './database/migrationController';
import mariaDbAdaptor from './database/mariaDbAdaptor';
import orm from './database/orm';
const TAG = 'index.js';
const port = configs.server.port;

orm.init();

const server = app.listen(port, () => {
	logger.info('index.js', `Node Server started at ${configs.server.protocol}://${configs.server.host}:${configs.server.port}`, {
		facility: 'index.mariaDb.js',
	});
});
let dbMigrationMode = 'none'; //configs.db.migrationsMode;

if ((dbMigrationMode === 'up') | (dbMigrationMode === 'down')) {
	migrationController
		.runDbMigrations()
		.then(() => {
			logger.info(TAG, 'DB migrations completed necessary migration steps');
		})
		.catch(err => {
			logger.error(TAG, 'Stopping because no db connection could be established', err);
			process.exit(0);
		});
}

const io = socket(server);
io.on('connection', function(socket) {
	io.emit('this', { will: 'be received by everyone' });
	socket.emit('news', { hello: 'world' });
	socket.emit('my other event', { serverSideMessage: 'world' });
	socket.on('my other event', function(data) {
		console.log('on received channel "my other event"', data);
	});
	socket.on('disconnect', function() {
		io.emit('user disconnected');
		process.exit(0);
	});
});
const closeResources = () => {
	mariaDbAdaptor.getPool().end();
	orm.close();
};
process.on('beforeExit', code => {
	closeResources();
	// Can make asynchronous calls
	setTimeout(() => {
		console.log(`Process will exit with code: ${code}`);
		process.exit(code);
	}, 100);
});

process.on('exit', code => {
	closeResources();
	// Only synchronous calls
	console.log(`Process exited with code: ${code}`);
});

process.on('SIGTERM', signal => {
	closeResources();
	console.log(`Process ${process.pid} received a SIGTERM signal`);
	process.exit(0);
});

process.on('SIGINT', signal => {
	closeResources();
	console.log(`Process ${process.pid} has been interrupted`);
	process.exit(0);
});
