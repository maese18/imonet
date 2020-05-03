import configs from '../config/configs';
import Sequelize from 'sequelize';
import user from '../models/user';
import individual from '../models/individual';
import tenant from '../models/tenant';
import mediaFile from '../models/mediaFile';
import realEstate from '../models/realEstate';
import individualMediaFilePermission from '../models/individualMediaFilePermission';
class Orm {
	constructor() {
		this.sequelizeAdapter = null;
	}
	init() {
		const sequelizeAdapter = new Sequelize(configs.db.database, configs.db.user, configs.db.password, {
			host: configs.db.host,
			port: configs.db.port,
			dialect: 'mariadb',
			pool: {
				max: 5,
				min: 0,
				acquire: 30000,
				idle: 10000,
			},
		});
		sequelizeAdapter
			.authenticate()
			.then(() => {
				console.log('Connection has been established successfully.');
				//console.log('defined models', models);
				const User = user(sequelizeAdapter);
				const Tenant = tenant(sequelizeAdapter);
				const MediaFile = mediaFile(sequelizeAdapter);
				const RealEstate = realEstate(sequelizeAdapter);
				const Individual = individual(sequelizeAdapter);
				const IndividualMediaFilePermission = individualMediaFilePermission(sequelizeAdapter);

				let models = { User, Individual, Tenant, MediaFile, RealEstate, IndividualMediaFilePermission };

				for (let key in models) {
					models[key].associate(models);
				}
				// Force=true will create tables
				sequelizeAdapter.sync({ force: true }).then(() => {
					// Add some data if not present
					Tenant.findAll()
						.then(tenants => {
							if (tenants.length === 0) {
								Tenant.create({ tenantName: 'Sample Tenant' }).then(createdTenant => {
									User.create({
										email: 'info@adivo.ch',
										password: 'pwHash',
										firstName: 'Vorname',
										lastName: 'Nachname',
										fk_tenant_id: createdTenant.id,
									});
								});

								RealEstate.create({ type: 'Wohnung', title: 'First Object' });
							}
						})
						.catch(err => {
							console.log(err);
						});
				});
			})
			.catch(err => {
				console.error('Unable to connect to the database:', err);
			});

		this.sequelizeAdapter = sequelizeAdapter;
	}
	getSequelizeAdapter() {
		return this.sequelizeAdapter;
	}
	close() {
		if (this.sequelizeAdapter) {
			this.sequelizeAdapter.close();
		}
	}
	User = () => this.sequelizeAdapter.models.user;
	Individual = () => this.sequelizeAdapter.models.individual;
	IndividualMediaFilePermission = () => this.sequelizeAdapter.models.individualMediaFilePermission;
	/** Returns the RealEstate Model */
	RealEstate = () => this.sequelizeAdapter.models.realEstate;
	/** Returns the MediaFile Model */
	MediaFile = () => this.sequelizeAdapter.models.mediaFile;
	Tenant = () => this.sequelizeAdapter.models.tenant;
}
const orm = new Orm();
export default orm;
