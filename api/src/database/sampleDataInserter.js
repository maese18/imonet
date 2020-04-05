// RUN from console with
// node -r esm src/controllers/domain/DomainController.datatest.js
//
import configs from '../config/configs';
import db from './mariaDbAdaptor';

let schema = configs.db.database;

const insertSampleData = async () => {
	let pool = db.getPool();
	console.log('Delete all from users', await pool.query(`DELETE FROM ${schema}.user WHERE id>=0`));
	console.log('Delete all from client', await pool.query(`DELETE FROM ${schema}.client WHERE id>=0`));
	console.log('Delete all from mediaFiles', await pool.query(`DELETE FROM ${schema}.mediaFile WHERE id>=0`));

	let client1 = `INSERT INTO ${schema}.client (id,name,street,zipCode,city) VALUES ('1','Kunde A','Nordstrasse','8600','Zürich')`;
	let result = await pool.query(client1);
	console.log('Insert into client', result);

	let client2 = `INSERT INTO ${schema}.client (id,name,street,zipCode,city) VALUES ('2','Kunde B','Südstrasse','8600','Zürich')`;
	result = await pool.query(client2);
	console.log('Insert into client', result);

	for (let i = 1; i < 100; i++) {
		let client1 = `INSERT INTO ${schema}.mediaFile (id,client_id,fileName,type) VALUES ('${i * 2}','1','File client 1-${i}','pdf')`;
		result = await pool.query(client1);
		console.log('Insert into mediaFile', result);

		let client2 = `INSERT INTO ${schema}.mediaFile (id,client_id,fileName,type) VALUES ('${i * 2 + 1}','2','File client 2-${i}','pdf')`;
		result = await pool.query(client2);
		console.log('Insert into mediaFile', result);
	}
};
/*insertSampleData()
	.then(result => {
		console.log(result);
		process.exit(0);
	})
	.catch(err => {
		console.log(err);
		process.exit(0);
	});
*/
export default insertSampleData;
