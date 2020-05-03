import ApplicationException from './ApplicationException';
import { LOG_TYPES } from './ApplicationException';

test('ApplicationException is constructed correctly', () => {
	let e = new ApplicationException({location:'location', message:'message', httpMessage'httpMessage', error:4, logType:LOG_TYPES.STACK_TRACE});

	expect(e.error).toBe(4);
	expect(e.name).toBe('ApplicationException');
});
