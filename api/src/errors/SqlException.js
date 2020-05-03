/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class SqlException extends ApplicationException {
	constructor(location, message, countException) {
		super({
			location,
			message,
			httpMessage: 'Unspecified SQL Exception. Search logs for the id to get more details.',
			error: ERROR.LOG_TYPES,
			logType: LOG_TYPES.STACK_TRACE,
			countException,
		});
	}
}
