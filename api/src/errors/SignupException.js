/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class SignupException extends ApplicationException {
	constructor(location, message, exception) {
		super({
			location,
			message,
			httpMessage: 'Signup failed with undefined error. See error logs for more details',
			exception,
			error: ERROR.Authentication,
			logType: LOG_TYPES.STACK_TRACE,
		});
	}
}
