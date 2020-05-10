import Sequelize from 'sequelize';
export default function realEstate(sequelizeAdapter) {
	const ApartmentBuilding = sequelizeAdapter.define(
		'appartmentBuilding',
		{
			// ID generated by clients using shortid before the server assigns a uniqueId
			clientSideId: { type: Sequelize.STRING },

			title: { type: Sequelize.STRING, allowNull: true },
			type: {
				type: Sequelize.ENUM('Wohnung', 'Wohnung/Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'),
				allowNull: true,
			},
			street: { type: Sequelize.STRING, allowNull: true },
			zipCode: { type: Sequelize.STRING, allowNull: true },
			price: { type: Sequelize.DECIMAL, allowNull: true },
			priceType: { type: Sequelize.ENUM('fix', 'negotiationPrice', 'noPrice'), allowNull: true },
			priceEffective: { type: Sequelize.DECIMAL, allowNull: true },
			description: { type: Sequelize.TEXT, allowNull: true },
		},
		{
			// options
		}
	);
	ApartmentBuilding.associate = function(models) {
		models.Tenant.hasMany(models.ApartmentBuilding, { foreignKey: 'fk_tenant_id' });
	};
	return ApartmentBuilding;
}
