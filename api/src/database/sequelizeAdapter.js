import configs from '../config/configs';
import Sequelize from 'sequelize';
import user from '../models/user';
import tenant from '../models/tenant';
import mediaFile from '../models/mediaFile';
import realEstate from '../models/realEstate';

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

		let models = { User, Tenant, MediaFile, RealEstate };

		for (let key in models) {
			models[key].associate(models);
		}
		sequelizeAdapter.sync({ force: true }).then(() => {
			// Add some data if not present
			Tenant.findAll()
				.then(tenants => {
					if (tenants.length === 0) {
						Tenant.create({ tenantName: 'Sample Tenant' }).then(createdTenant => {
							User.create({
								email: 'info@adivo.ch',
								passwordHash: 'pwHash',
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
export default sequelizeAdapter;
