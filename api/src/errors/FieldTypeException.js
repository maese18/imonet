/* istanbul ignore file */
import ApplicationException, { ERROR, LOG_TYPES } from './ApplicationException';

export default class FieldTypeException extends ApplicationException {
	constructor(location, message, countException) {
		super(location, message, '', ERROR.FieldType, LOG_TYPES.STACK_TRACE, countException);
	}
}
