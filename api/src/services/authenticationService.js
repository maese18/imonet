import AuthenticationException from '../errors/AuthenticationException';
import jwtProvider from './jwtProvider';
import { AUTH_TYPES, GROUPS } from '../config/constants';
/**
 * Provides the checkAuth method used as middleware. It verifies the provided JWT token stored in the authorizationHeader (formatted as  "Bearer {JWT}"")
 */
class AuthenticationService {
	/**
	 * All routes requiring to pass this check need to bear a valid jwt token witihn the Authorization headerbundleRenderer.renderToStream
	 * AND be a tenantUser, that is belong to tenantUser or tenantSuperUser group.
	 */
	checkAuth = (req, res, next) => {
		try {
			let authorizationHeader = req.headers.authorization;
			if (authorizationHeader && authorizationHeader !== '') {
				let decodedToken = jwtProvider.verifyJwt(authorizationHeader);
				let { tenantId, groupMember, groupMemberId } = decodedToken;
				if (groupMember < GROUPS.tenantUser.id) {
					throw new AuthorizationException(TAG, `Token verified successfully, but a user of group ${groupMember} cannot access this route`);
				}
				console.log(tenantId, groupMember, groupMemberId);
				req.app.locals.tenantId = tenantId;
				req.app.locals.groupMember = groupMember;
				req.app.locals.groupMemberId = groupMemberId;
				req.app.locals.authType = AUTH_TYPES.AUTHORIZED;
				next();
			} else {
				next(new AuthenticationException('AuthenticationController', `Header 'Authorization' does not contain a valid token`));
			}
		} catch (err) {
			next(err);
		}
	};
	checkOptionalAuth = (req, res, next) => {
		try {
			let authorizationHeader = req.headers.authorization;
			if (authorizationHeader && authorizationHeader !== '') {
				let decodedToken = jwtProvider.verifyJwt(authorizationHeader);
				let { tenantId, groupMember, groupMemberId } = decodedToken;
				console.log(tenantId, groupMember, groupMemberId);
				req.app.locals.tenantId = tenantId;
				req.app.locals.groupMember = groupMember;
				req.app.locals.groupMemberId = groupMemberId;
				req.app.locals.authType = AUTH_TYPES.OPTIONALLY_AUTHORIZED;
				next();
			} else {
				req.app.locals.groupMember = GROUPS.anonymous.name;
				req.app.locals.groupMemberId = GROUPS.anonymous.id;
				req.app.locals.authType = AUTH_TYPES.NO_AUTH_WHEN_OPTIONALLY_AUTHORIZED;
				next();
			}
		} catch (err) {
			next(err);
		}
	};
}
const authenticationService = new AuthenticationService();
export default authenticationService;
