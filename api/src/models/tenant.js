import Sequelize from 'sequelize';
export default function tenant(sequelizeAdapter) {
	const Tenant = sequelizeAdapter.define(
		'tenant',
		{
			tenantName: { type: Sequelize.STRING, allowNull: false },
		},
		{
			// options
		}
	);
	Tenant.associate = function(models) {};
	return Tenant;
}
