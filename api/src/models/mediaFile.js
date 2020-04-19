import Sequelize from 'Sequelize';
export default function mediaFile(sequelizeAdapter) {
	const MediaFile = sequelizeAdapter.define(
		'mediaFile',
		{
			// The effective filename on the file system.
			// Therefore, this fileName cannot be changed
			fileName: { type: Sequelize.STRING, allowNull: false },
			// The filename alias is initially the fileName but can be changed
			fileNameAlias: { type: Sequelize.STRING, allowNull: false },
			description: { type: Sequelize.TEXT },
			type: { type: Sequelize.STRING, allowNull: false },
			size: { type: Sequelize.DECIMAL, allowNull: false },
			//type: { type: Sequelize.ENUM('pdf', 'png', 'jpg', 'doc'), allowNull: false },
		},
		{
			// options
		}
	);
	MediaFile.associate = function(models) {
		models.Tenant.hasMany(models.MediaFile, { as: 'mediaFile', foreignKey: 'fk_tenant_id' });
		models.RealEstate.hasMany(models.MediaFile, { as: 'mediaFile', foreignKey: 'fk_realEstate_id' });
	};
	return MediaFile;
}
