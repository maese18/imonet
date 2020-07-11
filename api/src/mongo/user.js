import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
export default class User {
	constructor() {
		/**
		 * Users first name
		 * @type {string}
		 */
		this.firstName;
		/**
		 * Users last name
		 * @type {string}
		 */
		this.lastName;
		/**
		 * Users email
		 * @type {string}
		 */
		this.email;
		this._id;
		/**
		 * Password hash
		 * @type {string}
		 */
		this.passwordHash;

		/**
		 * GroupMember of
		 * @type {!Array}
		 */
		this.groupMember;
	}

	toPublic() {
		let { firstName, lastName, email, groupMember } = this;
		return { firstName, lastName, email, groupMember };
	}

	/**
	 * Creates a User.
	 * @param {string} email
	 * @param {string} password
	 * @param {string} firstName
	 * @param {string}lastName
	 * @param {string} groupMember 'tenantUser' or 'tenantSuperUser'
	 */
	static create({ email, password, firstName, lastName, groupMember = 'tenantUser', tenantId }) {
		let user = new User();
		user.firstName = firstName;
		user.lastName = lastName;
		user.email = email;
		user._id = email;
		user.passwordHash = User.createPasswordHash(password);
		user.groupMember = groupMember;
		user.tenantId = tenantId;
		return user;
	}
	/**
	 *
	 * @param {string} password
	 * @return {string} password hash
	 */
	static createPasswordHash(password) {
		const salt = bcrypt.genSaltSync(10);
		const passwordHash = bcrypt.hashSync(password, salt);
		return passwordHash;
	}
	static fromObject(object) {
		let user = new User();
		user.firstName = object.firstName;
		user.lastName = object.lastName;
		user.email = object._id;
		user.groupMember = object.groupMember;
		user.passwordHash = object.passwordHash;
		return user;
	}
	static validatePassword() {}
}
