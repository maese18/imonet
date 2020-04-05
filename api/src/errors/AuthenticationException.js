/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class AuthenticationException extends ApplicationException {
	constructor(location, message) {
		super(location, message, '', ERROR.Unauthorized, LOG_TYPES.STACK_TRACE);
	}
}
