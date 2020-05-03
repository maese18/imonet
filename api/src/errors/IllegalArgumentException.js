/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class IllegalArgumentException extends ApplicationException {
	constructor(location, message, exception) {
		super({ location, message, httpMessage: '', error: ERROR.IllegalArgument, logType: LOG_TYPES.STACK_TRACE, exception });
	}
}
