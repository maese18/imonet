import { JWK, JWT } from 'jose';
import jwt from 'jsonwebtoken';
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
	signJwt({ groupMember, groupMemberId, tenantId, userOrIndividualId }) {
		var token = jwt.sign({ groupMember, groupMemberId, tenantId, userOrIndividualId }, configs.jwt.secret, {
			expiresIn: 86400, // expires in 24 hours
			audience: 'imonet',
			issuer: 'adivo',
			subject: 'api.imonet.ch',
		});
		return 'Bearer ' + token;
	}
	/* Deprecated */
	sign(payload) {
		let savePayload = {
			'urn:imonet:claim': payload.tenantId,
		};
		const token = JWT.sign(savePayload, key, {
			audience: ['urn:imonet:client'],
			issuer: 'https://api.adivo.com',
			expiresIn: '24 hours',

			header: {
				type: 'JWT',
				tenantId: payload.tenantId,
			},
		});
		return 'Bearer ' + token;
	}
	verifyJwt(token) {
		try {
			let tokenNoScheme = token.substr('Bearer '.length);
			return jwt.verify(tokenNoScheme, configs.jwt.secret);
		} catch (err) {
			throw new AuthenticationException(TAG, 'JWT token verification failed');
		}
	}
	/* Deprecated */
	verify(token) {
		try {
			let tokenNoScheme = token.substr('Bearer '.length);
			let verified = JWT.verify(tokenNoScheme, key, {
				audience: ['urn:imonet:client'],
				issuer: 'https://api.adivo.com',
				clockTolerance: '1 min',
			});
			let decodedToken = JWT.decode(tokenNoScheme, { complete: true });
			return verified;
		} catch (err) {
			throw new AuthenticationException(TAG, 'JWT token verification failed');
		}
	}
}

let jwtProvider = new JwtProvider();
export default jwtProvider;
