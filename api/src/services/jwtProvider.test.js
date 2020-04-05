import jwtProvider from './jwtProvider';
import AuthenticationException from '../errors/AuthenticationException';
describe('JwtProvider testimg', () => {
	test('sign/verify method', () => {
		let tokenWithBearer = jwtProvider.sign({ customer: 1, msg: 'Message' });

		let verified = jwtProvider.verify(tokenWithBearer);

		expect(verified.msg).toBe('Message');
		expect(verified.customer).toBe(1);
	});

	test('verify with illegal token', () => {
		let tokenWithBearer = jwtProvider.sign({ customer: 1, msg: 'Message' });

		expect(() => jwtProvider.verify(tokenWithBearer.substring(1))).toThrow(AuthenticationException);
	});
});
