import request from 'supertest';
import configs from '../../config/configs';
import bodyParser from 'body-parser';
import HttpStatusCodes from '../../utils/HttpStatusCodes';
import realEstateController from './realEstateController';
import express from 'express';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/realEstates', realEstateController.getRouter());

describe('realEstateController test suite', () => {
	test('createOne', done => {
		// Setup required mocks
		let sequelizeCreateMock = jest.fn(({ realEstate }) => Promise.resolve({ title: 'new Real Estate', type: 'Wohnung', id: 215 }));
		realEstateController.RealEstate = { createOne_mock };

		// Test functionality
		request(app)
			.post(`/${configs.api.basePath}/realEstates`)
			.set('Accept', 'application/json')
			.set('tenant-id', 2)
			.send({ title: 'new Real Estate', type: 'Wohnung' })
			.then(result => {
				console.log('CREATED ', res.body);
				done();
			})
			.catch(e => {
				done();
			});

		/* expect(res.statusCode).toBe(HttpStatusCodes.Created);
		expect(res.type).toBe('application/json');
		expect(res.body).toStrictEqual({ created: { fileName: 'new file', type: 'doc', id: 215 } }); */
	});
});
