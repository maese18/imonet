/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class SignupException extends ApplicationException {
	constructor(location, message, countException) {
		super(location, message, '', ERROR.Authentication, LOG_TYPES.STACK_TRACE, countException);
	}
}
