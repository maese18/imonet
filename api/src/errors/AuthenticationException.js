/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class AuthenticationException extends ApplicationException {
	constructor(location, message, exception) {
		//constructor({ location, message, httpMessage, error, logType = LOG_TYPES.STACK_TRACE, countException = true }) {
		super({ location, message, httpMessage: '', exception, error: ERROR.Unauthorized, logType: LOG_TYPES.STACK_TRACE });
	}
}
