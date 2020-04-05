import { logErrors, sendExceptionToClient } from './errorHandler';
import logger from '../utils/logger/logger';
const req = {};

//mock logErrors to avoid stack trace logged
logger.error = (location, message, error) => {
	if (process.env.NODE_ENV !== 'test') {
		console.log(location + ': mock error log=>' + message, error);
	}
};

class ResponseMock {
	status() {
		return this;
	}
	json(json) {
		this.json = json;
	}
}

let res = new ResponseMock();
let next = () => {};
let count_log = 0;
let count_httpException = 0;

class MockException {
	log() {
		count_log++;
	}
}

class MockExceptionWithHttpConverter {
	toHttpException() {
		count_httpException++;
	}
}

describe('error handler test', () => {
	test('error logging is delegated to Exception class if log function exists', () => {
		count_log = 0;
		let mockException = new MockException();
		logger.info('errorHandler', 'The following error stack trace is expected');
		logErrors(mockException, req, res, next);
		expect(count_log).toBe(1);
	});

	test('error logging directly by logger when Exception class got no log function.', () => {
		count_log = 0;
		logErrors(new Error(), req, res, next);
		expect(count_log).toBe(0);
	});

	test('that MockExceptionWithHttpConverter is propagated correctly to http response.', () => {
		let e = new MockExceptionWithHttpConverter();
		count_httpException = 0;
		sendExceptionToClient(e, req, res, next);
		expect(count_httpException).toBe(1);
	});

	test('that error is propagated correctly to http response.', () => {
		count_httpException = 0;
		sendExceptionToClient(new Error(), req, res, next);
		expect(count_httpException).toBe(0);
	});
});
