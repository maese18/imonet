/* istanbul ignore file */
import configs from '../../config/configs';
import winston from 'winston';
import { format } from 'logform';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import GelfTransport from 'winston-gelf';

const transports = [];
let env = process.env.NODE_ENV;

console.log('configs=', configs);
// see https://www.npmjs.com/package/winston-daily-rotate-file for configuration params
// see https://blog.abelotech.com/posts/rotate-winston-logs-based-on-time/
// Rotating file for all levels
let applicationLog = new DailyRotateFile({
	datePattern: 'YYYY-MM-DD-HH',
	zippedArchive: false,

	maxFiles: 2,
	filename: path.join('..', 'logs', 'application-%DATE%.log'),
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
		format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
	),
});
/* istanbul ignore next */
applicationLog.on('logRemoved', function(removedFilename) {
	// do something fun
	/* istanbul ignore next */
	console.log('remove log ' + removedFilename);
});
transports.push(applicationLog);

// Rotating file for error level
transports.push(
	new DailyRotateFile({
		datePattern: 'YYYY-MM-DD-HH',
		zippedArchive: true,
		maxSize: '20kb',
		maxFiles: 2,
		level: 'error',
		filename: path.join('..', 'logs', 'error-%DATE%.log'),
		format: format.combine(
			format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
			format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
		),
	})
);

//
// Gelf (Graylog extended log format) is used to send messages to Graylog
// However do not configure GELF transport in test environment. Jest tears down the environment otherwise.
if (env !== 'test') {
	transports.push(
		new GelfTransport({
			gelfPro: {
				fields: {
					env: configs.env,
					facility: 'not set', // default facility if not overwritten in log statement
				},
				adapterName: 'tcp', // optional; currently supported "udp", "tcp" and "tcp-tls"; default: udp
				adapterOptions: {
					// this object is passed to the adapter.connect() method
					host: configs.graylog.host, // optional; default: 127.0.0.1
					port: configs.graylog.port, // optional; default: 12201
				},
			},
		})
	);
}
// Other examples
// This setting would add console output in json format
// transports.push(new winston.transports.Console());

// Write to all logs with level `info` and below to `combined.log`
// transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));

// Write all logs error (and below) to `error.log`.
// transports.push(new winston.transports.File({ filename: 'logs/combined.log' }));
const winstonLogger = winston.createLogger({
	transports: transports,
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (configs.env !== 'PROD') {
	winstonLogger.add(
		new winston.transports.Console({
			level: 'debug', //set to debug if you need more details
			format: format.combine(
				format.colorize(),
				format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
				format.align(),
				format.printf(info => `${info.timestamp} ${info.level}, ${(info.facility + ':                        ').substr(0, 23)} ${info.message}`)
			),
		})
	);
}

let logger;
if (env !== 'test-') {
	logger = {
		info: (location, message) => {
			winstonLogger.info(message, { facility: location });
		},
		warn: (location, message) => {
			winstonLogger.warn(message, { facility: location });
		},
		debug: (location, message) => {
			winstonLogger.debug(message, { facility: location });
		},
		error: (location, message, error = {}) => {
			winstonLogger.error(message, { facility: location, error: error.stack });
		},
		printErrorMessage: (location, message, error = {}) => {
			winstonLogger.error(`${error.name}, Message: ${message}`, {
				facility: location + (error.id ? ` ID ${error.id}` : ''),
				error: error.name,
			});
		},
		printStackTrace: (location, message, error = {}) => {
			winstonLogger.error(error.stack, {
				message,
				facility: location,
				error: error.stack,
			});
		},
	};
} else {
	logger = {
		info: (location, message) => {},
		warn: (location, message) => {},
		debug: (location, message) => {},
		error: (location, message, error) => {},
		printErrorMessage: (location, message, error = {}) => {},
		printStackTrace: (location, message, error = {}) => {},
	};
}

let TAG = 'logger';
if (env !== 'test') {
	logger.info(TAG, 'info level logger configured to write to console, daily rotating file (application) and to graylog');
	logger.debug(TAG, 'debug level logger configured to write to console only');
	logger.warn(TAG, 'warn level logger configured to write to console, daily rotating file (application) and to graylog');
	logger.error(TAG, 'error level logger configured to write to console, daily rotating files (application and error) and to graylog', {
		error: 'any error',
	});
}
export default logger;
