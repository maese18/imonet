import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import AuthenticationException from '../../errors/AuthenticationException';
import SignupException from '../../errors/SignupException';
import orm from '../../database/orm';
import { GROUPS } from '../../config/constants';
import jwtProvider from '../../services/jwtProvider';
import bcrypt from 'bcryptjs';
import { formatResponseItem, formatResponseItems } from '../utils/controllerUtil';
const TAG = 'UserController';
logger.info(TAG, 'Module import running');

class UserController {
	constructor() {
		this.orm = orm;
	}

	login = (req, res, next) => {
		let { email, password } = req.body;
		let User = this.orm.User();

		User.findOne({ where: { email: email } })
			.then(user => {
				// Load hash from your password DB.
				//if (users.length === 1) {
				bcrypt.compare(password, user.password).then(function(result) {
					if (result === true) {
						let token = jwtProvider.signJwt({
							groupMember: user.groupMember,
							groupMemberId: GROUPS[user.groupMember].id,
							tenantId: user.fk_tenant_id,
							userOrIndividualId: user.id,
						});

						res.status(HttpStatusCodes.Ok)
							.type('json')
							.send({ token: token });
					} else {
						next(new SignupException(TAG, 'Authentication failed'));
					}
				});
			})
			.catch(e => next(new AuthenticationException(TAG, 'No user with this username or password is known', e)));
	};
	/**
	 * Signup a new user for a given tenant
	 * @param {*} req
	 * @param {*} res
	 * @param {*} next
	 */
	signup = (req, res, next) => {
		let { email, password, firstName, lastName, tenantId } = req.body;

		let User = this.orm.User();
		this.orm
			.User()
			.count({
				where: {
					email: req.body.email,
				},
			})
			.then(count => {
				if (count > 0) {
					//next(new SignupException(TAG, `Failed to signup user. Reason: email ${req.body.email} exists`));
					throw new SignupException(TAG, `Failed to signup user. Reason: email ${req.body.email} exists`);
				} else {
					User.create({ email, firstName, lastName, password, fk_tenant_id: tenantId })
						.then(created => {
							res.status(HttpStatusCodes.Created)
								.type('json')
								.send(formatResponseItem(req, { id: created.id }));
						})
						.catch(e => next(new SignupException(TAG, 'Failed to signup user.', e)));
				}
			})
			.catch(e => {
				//console.log(e);
				next(e);
			});
	};
}
const userController = new UserController();
export default userController;
