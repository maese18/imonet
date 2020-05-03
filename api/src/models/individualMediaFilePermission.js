import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
export default function individualModel(sequelizeAdapter) {
	const IndividualMediaFilePermission = sequelizeAdapter.define('individualMediaFilePermission', {
		validFrom: {
			type: Sequelize.DATE,
		},
		validTo: {
			type: Sequelize.DATE,
		},
	});
	IndividualMediaFilePermission.associate = function(models) {
		models.Individual.hasMany(models.IndividualMediaFilePermission, { foreignKey: 'fk_individual_id' });
		models.MediaFile.hasMany(models.IndividualMediaFilePermission, { foreignKey: 'fk_mediaFile_id' });
	};
	return IndividualMediaFilePermission;
}
