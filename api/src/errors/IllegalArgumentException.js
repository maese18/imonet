/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class IllegalArgumentException extends ApplicationException {
	constructor(location, message, countException) {
		super(location, message, '', ERROR.IllegalArgument, LOG_TYPES.STACK_TRACE, countException);
	}
}
