import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import AuthenticationException from '../../errors/AuthenticationException';
import SignupException from '../../errors/SignupException';
import mongoDb from '../../database/mongodb';
import User from '../../mongo/user';
import { ObjectID } from 'mongodb';

import { GROUPS } from '../../config/constants';
import jwtProvider from '../../services/jwtProvider';
import bcrypt from 'bcryptjs';
import { formatResponseItem, formatResponseItems } from '../utils/controllerUtil';
const TAG = 'UserController';
logger.info(TAG, 'Module import running');

class UserControllerMongoDb {
	constructor() {
		this.mongoDbAdapter = mongoDb;
		this.ObjectID = ObjectID;
	}

	login = (req, res, next) => {
		let db = this.mongoDbAdapter.db;
		let { email, password } = req.body;
		let users = db.collection('users');
		users
			.findOne({ email })
			.then(user => {
				// Load hash from your password DB.
				//if (users.length === 1) {
				bcrypt.compare(password, user.passwordHash).then(function(result) {
					if (result === true) {
						let token = jwtProvider.signJwt({
							groupMember: user.groupMember,
							groupMemberId: GROUPS[user.groupMember].id,
							tenantId: user.tenantId,
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
		let db = this.mongoDbAdapter.db;
		let { email, password, firstName, lastName, tenantId } = req.body;
		let users = db.collection('users');
		users
			.findOne({ _id: email })
			.then(result => {
				if (result !== null) {
					//next(new SignupException(TAG, `Failed to signup user. Reason: email ${req.body.email} exists`));
					throw new SignupException(TAG, `Failed to signup user. Reason: email ${email} exists`);
				}

				let user = User.create({ email, firstName, lastName, password, fk_tenant_id: tenantId });
				users
					.insertOne(user)
					.then(result => {
						let createdUser = User.fromObject(result.ops[0]);
						let publicCreatedUser = createdUser.toPublic();
						res.status(HttpStatusCodes.Created)
							.type('json')
							.send(formatResponseItem(req, publicCreatedUser));
					})
					.catch(e => next(new SignupException(TAG, 'Failed to signup user.', e)));
			})
			.catch(e => next(e));
	};
}
const userController = new UserControllerMongoDb();
export default userController;
