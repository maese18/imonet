import Sequelize from 'sequelize';
export default function realEstate(sequelizeAdapter) {
	const RealEstate = sequelizeAdapter.define(
		'realEstate',
		{
			title: { type: Sequelize.STRING, allowNull: false },
			type: {
				type: Sequelize.ENUM('Wohnung', 'Wohnung/Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'),
				allowNull: false,
			},
			street: { type: Sequelize.STRING, allowNull: true },
			zipCode: { type: Sequelize.STRING },
			price: { type: Sequelize.DECIMAL },
			priceType: { type: Sequelize.ENUM('fix', 'negotiationPrice', 'noPrice') },
			priceEffective: { type: Sequelize.DECIMAL },
			description: { type: Sequelize.TEXT },
		},
		{
			// options
		}
	);
	RealEstate.associate = function(models) {
		models.Tenant.hasMany(models.RealEstate, { as: 'realEstate', foreignKey: 'fk_tenant_id' });
	};
	return RealEstate;
}
