/* istanbul ignore file */
import HttpStatusCodes from '../utils/HttpStatusCodes';

let exceptionCount = 0;
export const LOG_TYPES = {
	STACK_TRACE: 'stackTrace',
	SHORT_ERROR: 'shortError',
};

export const ERROR = {
	Authentication: { code: 1, http: HttpStatusCodes.Unauthorized },
	Unauthorized: { code: 2, http: HttpStatusCodes.Unauthorized },
	FieldType: { code: 3, http: HttpStatusCodes.Conflict },
	IllegalArgument: { code: 4, http: HttpStatusCodes.BadRequest },
	MissingMandatoryField: { code: 5, http: HttpStatusCodes.Conflict },
	InternalServer: { code: 6, http: HttpStatusCodes.InternalServerError },
	Sql: { code: 7, http: HttpStatusCodes.InternalServerError },
	UrlNotDefined: { code: 8, http: HttpStatusCodes.NotFound },
	Validation: { code: 9, http: HttpStatusCodes.BadRequest },
};

export default class ApplicationException extends Error {
	static resetExceptionCount() {
		exceptionCount = 0;
	}

	constructor(location, message, httpMessage, error, logType = LOG_TYPES.STACK_TRACE, countException = true) {
		super(message);
		this.httpMessage = httpMessage ? httpMessage : message;
		this.logType = logType;
		this.location = location;
		this.error = error;
		this.id = `[[${exceptionCount}]]`;
		// see https://stackoverflow.com/questions/31089801/extending-error-in-javascript-with-es6-syntax-babel/32749533
		this.name = this.constructor.name;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = new Error(message).stack;
		}

		if (countException) exceptionCount++;
	}

	// Attaches exception to response
	toHttpException(res) {
		res.status(this.error.http).json({
			status: this.error.http,
			error: this.name,
			errorCode: this.error.code,
			id: this.id,
			message: this.httpMessage,
		});
	}

	// Defines how the exception is logged.
	log(logger) {
		if (this.logType === LOG_TYPES.STACK_TRACE) {
			logger.printStackTrace(this.location, this.message, this);
		} else {
			logger.printErrorMessage(this.location, this.message, this);
		}
	}

	getLocation() {
		return this.location;
	}

	getErrorCode() {
		return this.error;
	}
}
