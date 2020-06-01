import morgan from 'morgan';
import logger from './logger';
/* istanbul ignore file */
const format = {
	PROD: morgan('combined'), //'combined' outputs the Apache style LOGs
	TEST: morgan('dev'),
	DEV: morgan('dev'),
};
export default (app, configs) => {
	if (process.env.NODE_ENV !== 'test') {
		if (format[configs.env]) {
			app.use(format[configs.env]);
		} else {
			app.use(format.PROD);
		}

		// Log morgan request logs to graylog
		// See https://www.loggly.com/docs/node-express-js-morgan-logging/
		const loggerStream = {
			write: function(message) {
				logger.info('HTTP', message);
			},
		};

		//app.use(morgan('combined', { stream: loggerStream }));
	}
};
