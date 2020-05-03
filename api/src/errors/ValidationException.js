/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class ValidationException extends ApplicationException {
	constructor(location, message, countException) {
		super({
			location,
			message,
			httpMessage: '',
			error: ERROR.Validation,
			logType: LOG_TYPES.STACK_TRACE,
			countException,
		});
	}
}
