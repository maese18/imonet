import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
export default function userModel(sequelizeAdapter) {
	const User = sequelizeAdapter.define(
		'user',
		{
			email: {
				type: Sequelize.STRING,
				allowNull: false,
				validate: {
					isEmail: true,
				},
			},
			password: {
				type: Sequelize.STRING,
				allowNull: false,
				set(value) {
					const salt = bcrypt.genSaltSync(10);
					const passwordHash = bcrypt.hashSync(value, salt);
					this.setDataValue('password', passwordHash);
				},
			},
			// attributes
			firstName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			lastName: {
				type: Sequelize.STRING,
				// allowNull defaults to true
			},
			groupMember: {
				type: Sequelize.ENUM('tenantUser', 'tenantSuperUser'),
				defaultValue: 'tenantUser',
			},
		},
		{
			// options
			instanceMethods: {
				generateHash: function(password) {
					return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
				},
				validPassword: function(password) {
					return bcrypt.compareSync(password, this.password);
				},
			},
		}
	);
	User.associate = function(models) {
		models.Tenant.hasMany(models.User, { foreignKey: 'fk_tenant_id' });
	};
	return User;
}
