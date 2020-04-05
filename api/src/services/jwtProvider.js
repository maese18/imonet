import { JWK, JWT } from 'jose';
import AuthenticationException from '../errors/AuthenticationException';
import configs from '../config/configs';
const TAG = 'JWTController';

let key;
class JwtProvider {
	constructor() {
		key = JWK.asKey({
			kty: 'oct',
			k: configs.jwt.secret,
		});
	}

	sign(payload) {
		const token = JWT.sign(payload, key, {
			audience: 'tbd', // must be verified too
			issuer: 'tbd', // must be verified too
			expiresIn: '2 hours',
			header: {
				type: 'JWT',
			},
		});
		return 'Bearer ' + token;
	}

	verify(token) {
		try {
			let tokenNoScheme = token.substr('Bearer '.length);
			let verified = JWT.verify(tokenNoScheme, key, {
				audience: 'tbd',
				issuer: 'tbd',
				clockTolerance: '1 min',
			});
			return verified;
		} catch (err) {
			throw new AuthenticationException(TAG, 'JWT token verification failed');
		}
	}
}

let jwtProvider = new JwtProvider();
export default jwtProvider;
