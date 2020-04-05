import AuthenticationException from '../errors/AuthenticationException';
import jwtProvider from './jwtProvider';

class AuthenticationController {
	checkAuth = (req, res, next) => {
		try {
			let authorizationHeader = req.headers.authorization;
			if (authorizationHeader && authorizationHeader !== '') {
				req.decodedToken = jwtProvider.verify(authorizationHeader);
				next();
			} else {
				next(new AuthenticationException('AuthenticationController', `Header 'Authorization' does not contain a valid token`));
			}
		} catch (err) {
			next(err);
		}
	};
}
const authenticationService = new AuthenticationController();
export default authenticationService;
