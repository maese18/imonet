import request from 'supertest';
import configs from '../../config/configs';
import bodyParser from 'body-parser';
import realEstateController from './realEstateController';
import express from 'express';
import IllegalArgumentException from '../../errors/IllegalArgumentException';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/realEstates', realEstateController.findAll);
app.get('/api/realEstates/:realEstateId', realEstateController.findOne);
app.post('/api/realEstates', realEstateController.create);

describe('realEstateController test suite', () => {
	test('POST /api/realEstates returns expected http response', done => {
		// Setup required mocks
		let sequelizeCreateMock = jest.fn(({ realEstate }) =>
			Promise.resolve({
				id: 2,
				clientSideId: 'jkjkl',
				fk_tenant_id: '1',
				title: 'erste immo',
				updatedAt: '2020-04-28T19:57:55.971Z',
				createdAt: '2020-04-28T19:57:55.971Z',
			})
		);
		realEstateController.orm.RealEstate = () => {
			return { create: sequelizeCreateMock };
		};

		// Test functionality
		request(app)
			.post(`/${configs.api.basePath}/realEstates`)
			.set({ Accept: 'application/json', tenantId: 1 })
			.send({ title: 'erste immo' })
			.then(res => {
				expect(res.body.item).toEqual({
					id: 2,
					clientSideId: 'jkjkl',
					fk_tenant_id: '1',
					title: 'erste immo',
					updatedAt: '2020-04-28T19:57:55.971Z',
					createdAt: '2020-04-28T19:57:55.971Z',
				});

				done();
			})
			.catch(e => {
				console.log('Exception', e);
				done(e);
			});
	});
	test('POST /api/realEstates returns exception', done => {
		realEstateController.orm.RealEstate = () => {
			return {
				create: () => {
					throw new IllegalArgumentException('RealEstateController', 'message');
				},
			};
		};
		request(app)
			.post(`/${configs.api.basePath}/realEstates`)
			.set({ Accept: 'application/json', tenantId: 1 })

			.send({ title: 'zweite immo' })
			.catch(e => {
				console.log('error', e);

				expect(e.name).toEqual('IllegalArgumentException');
				done();
			});
		done();
	});
	test('GET /api/realEstates/:realEstateId returns a realEstate item', done => {
		// Setup required mocks
		realEstateController.orm.RealEstate = function() {
			return {
				findOne: function() {
					return Promise.resolve({ id: 1, title: 'Real Estate Title' });
				},
			};
		};
		request(app)
			.get(`/${configs.api.basePath}/realEstates/3`)
			.set({ Accept: 'application/json', tenantId: 1 })
			.send()
			.then(res => {
				expect(res.body.item).toEqual({ id: 1, title: 'Real Estate Title' });
				expect(res.status).toBe(HttpStatusCodes.Ok);
				done();
			})
			.catch(e => {
				done();
			});
	});

	test('GET /api/realEstates returns realEstates items', done => {
		// Setup required mocks
		realEstateController.orm.RealEstate = () => {
			return {
				findAll: function() {
					return Promise.resolve([{ id: 1, title: 'Real Estate Title' }]);
				},
			};
		};
		request(app)
			.get(`/${configs.api.basePath}/realEstates`)
			.set({ Accept: 'application/json', tenantId: 1 })
			.send()
			.then(res => {
				expect(res.body.items).toEqual([{ id: 1, title: 'Real Estate Title' }]);
				done();
			})
			.catch(e => {
				done();
			});
	});
});
