/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class SignupException extends ApplicationException {
	constructor(location, message, exception) {
		super({
			location,
			message,
			httpMessage: message,
			exception,
			error: ERROR.Authentication,
			logType: LOG_TYPES.STACK_TRACE,
		});
	}
}
