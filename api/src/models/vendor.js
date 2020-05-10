import Sequelize from 'sequelize';
export default function realEstate(sequelizeAdapter) {
	const Vendor = sequelizeAdapter.define(
		'vendor',
		{
			// ID generated by clients using shortid before the server assigns a uniqueId
			clientSideId: { type: Sequelize.STRING },

			company: { type: Sequelize.STRING, allowNull: true },
			street: { type: Sequelize.STRING, allowNull: true },
			zipCode: { type: Sequelize.STRING, allowNull: true },
		},
		{
			// options
		}
	);
	Vendor.associate = function(models) {
		models.Vendor.hasMany(models.RealEstate, { foreignKey: 'fk_vendor_id' });
	};
	return Vendor;
}
