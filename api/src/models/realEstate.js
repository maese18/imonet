import Sequelize from 'sequelize';
export default function realEstate(sequelizeAdapter) {
	const RealEstate = sequelizeAdapter.define(
		'realEstate',
		{
			// ID generated by clients using shortid before the server assigns a uniqueId
			clientSideId: { type: Sequelize.STRING },

			title: { type: Sequelize.STRING, allowNull: true },
			type: {
				type: Sequelize.ENUM('Wohnung', 'Haus', 'Parkplatz', 'Garagenplatz', 'Grundstück', 'MFH', 'Landwirtschaft', 'Büro/Gewerbe/Industrie'),
				allowNull: true,
			},
			street: { type: Sequelize.STRING, allowNull: true },
			zipCode: { type: Sequelize.STRING, allowNull: true },
			price: { type: Sequelize.DECIMAL, allowNull: true },
			priceType: { type: Sequelize.ENUM('fix', 'negotiationPrice', 'noPrice'), allowNull: true },
			priceEffective: { type: Sequelize.DECIMAL, allowNull: true },
			description: { type: Sequelize.TEXT, allowNull: true },
			// object type
			objectType: { type: Sequelize.STRING, allowNull: true },

			// Miete / Kauf
			isRental: { type: Sequelize.BOOLEAN },

			// Verfügbarkeit
			availability: { type: Sequelize.ENUM('asOfDate', 'atOnce', 'onRequest') }, //ab Datum, ab sofort, auf Anfrage
			availabilityDate: { type: Sequelize.DATE, allowNull: true },
			// Spezific for Wohnung
			//
			// Def. Immoscout

			// Rooms
			roomCount: { type: Sequelize.DECIMAL, allowNull: true },

			// Wohnfläche
			// Fläche des Aufenthaltsbereichs in einem Wohnobjekt inklusive Küche, Badezimmer, WC, Treppen und Flure.
			// Nicht enthalten sind Abstell- und Technikräume. Räumlich oder klimatisch nur bedingt nutzbare Flächen
			// (Dachschrägen, Balkone, Terrassen, Aussenbäder) werden in Prozentanteilen angerechnet.*/
			livingSpace: { type: Sequelize.DECIMAL, allowNull: true },

			// Stockwerk
			floor: { type: Sequelize.SMALLINT, allowNull: true },

			// ---------------------------------------------------------
			// House specific

			// Grundstückfläche
			plotArea: { type: Sequelize.SMALLINT },

			// ---------------------------------------------------------
			// Appartment Building specific

			appartmentCount: { type: Sequelize.SMALLINT },
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
