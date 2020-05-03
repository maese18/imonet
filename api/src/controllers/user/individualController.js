import logger from '../../utils/logger/logger';
import HttpStatusCodes from '../utils/HttpStatusCodes';
import AuthenticationException from '../../errors/AuthenticationException';
import SignupException from '../../errors/SignupException';
import orm from '../../database/orm';
import { GROUPS } from '../../config/constants';
import jwtProvider from '../../services/jwtProvider';
import bcrypt from 'bcryptjs';
import { formatResponseItem, formatResponseItems } from '../utils/controllerUtil';
const TAG = 'IndividualController';
logger.info(TAG, 'Module import running');

class IndividualController {
	constructor() {
		this.orm = orm;
	}

	login = (req, res, next) => {
		let { email, password } = req.body;
		let Individual = this.orm.Individual();

		Individual.findOne({ where: { email: email } })
			.then(individual => {
				bcrypt
					.compare(password, individual.password)
					.then(function(result) {
						if (result === true) {
							let token = jwtProvider.signJwt({
								groupMember: GROUPS.individual.name,
								groupMemberId: GROUPS.individual.id,
							});

							res.status(HttpStatusCodes.Ok)
								.type('json')
								.send({ token: token });
						} else {
							next(new SignupException(TAG, 'Authentication failed'));
						}
					})
					.catch(e => next(new AuthenticationException(TAG, 'Failed to login individual', e)));
			})
			.catch(e => next(new AuthenticationException(TAG, 'No Individual with this username or password is known', e)));
	};
	/**
	 * Signup a new Individual for a given tenant
	 * @param {*} req
	 * @param {*} res
	 * @param {*} next
	 */
	signup = (req, res, next) => {
		let { email, password, firstName, lastName, tenantId } = req.body;

		let Individual = this.orm.Individual();
		this.orm
			.Individual()
			.count({
				where: {
					email: req.body.email,
				},
			})
			.then(count => {
				if (count > 0) {
					next(new SignupException(TAG, `Failed to signup Individual. Reason: email ${req.body.email} exists`));
				} else {
					Individual.create({ email, firstName, lastName, password })
						.then(created => {
							res.status(HttpStatusCodes.Created)
								.type('json')
								.send(formatResponseItem(req, { id: created.id }));
						})
						.catch(e => next(new SignupException(TAG, 'Failed to signup Individual.', e)));
				}
			})
			.catch(e => {
				console.log(e);
				next(e);
			});
	};
}
const individualController = new IndividualController();
export default individualController;
