import Sequelize from 'sequelize';
export default function userModel(sequelizeAdapter) {
	const User = sequelizeAdapter.define(
		'user',
		{
			email: { type: Sequelize.STRING, allowNull: false },
			passwordHash: { type: Sequelize.STRING, allowNull: false },
			// attributes
			firstName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			lastName: {
				type: Sequelize.STRING,
				// allowNull defaults to true
			},
		},
		{
			// options
		}
	);
	User.associate = function(models) {
		models.Tenant.hasMany(models.User, { as: 'users', foreignKey: 'fk_tenant_id' });
	};
	return User;
}
