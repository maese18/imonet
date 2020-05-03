/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class AuthorizationException extends ApplicationException {
	constructor(location, message, exception) {
		super({ location, message, httpMessage: '', error: ERROR.Unauthorized, logType: LOG_TYPES.STACK_TRACE, exception });
	}
}
