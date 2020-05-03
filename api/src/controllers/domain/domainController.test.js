import request from 'supertest';
import configs from '../../config/configs';
import bodyParser from 'body-parser';
import HttpStatusCodes from '../../utils/HttpStatusCodes';
import domainController from './DomainController';
import express from 'express';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', domainController.getRouter());

describe('domainController test suite', () => {
	test('findAllByQuery', async () => {
		const findAllByQuery_mock = () => {
			return new Promise(resolve => {
				resolve({
					totalItemsCount: 0,
					verifiedAttributes: 'id,email,passwordHash,firstName,lastName',
					data: [],
				});
			});
		};
		domainController.crudRepo = {
			findAllByQuery: findAllByQuery_mock,
		};
		const res = await request(app).get(
			`/${configs.api.basePath}/${configs.domain.multiTenantDomains[0]}s?tenantId=2&filters=fileName.eq(z-file),id.lt(100)&pageNum=0&pageSize=20`
		);
		//console.log('data', res.body.items);
		expect(res.statusCode).toBe(HttpStatusCodes.Ok);
		expect(res.type).toBe('application/json');
		expect(res.body.items.length).toBe(0);
		expect(res.body.pagination).toStrictEqual({
			totalItems: 0,
			pageNum: 0,
			pageSize: 20,
			first: '/api/users?filters=fileName.eq(z-file),id.lt(100)&pageNum=0&pageSize=20',
			last: '/api/users?filters=fileName.eq(z-file),id.lt(100)&pageNum=0&pageSize=20',
		});

		expect(res.body.query).toStrictEqual({
			tenantId: '2',
			filters: 'fileName.eq(z-file),id.lt(100)',
			pageNum: '0',
			pageSize: '20',
		});
	});

	test('findOne', async () => {
		const findOne_mock = () => {
			return new Promise(resolve => {
				resolve({
					item: {
						id: 196,
						client_id: 1,
						fileName: 'File client 2-98',
						type: 'pdf',
					},
				});
			});
		};
		// Inject mock
		domainController.crudRepo.findOne = findOne_mock;

		const res = await request(app).get(`/${configs.api.basePath}/${configs.domain.multiTenantDomains[0]}s/196?tenantId=2`);
		expect(res.statusCode).toBe(HttpStatusCodes.Ok);
		expect(res.type).toBe('application/json');
		expect(res.body.item).toStrictEqual({
			item: {
				id: 196,
				client_id: 1,
				fileName: 'File client 2-98',
				type: 'pdf',
			},
		});
	});

	test('createOne', async () => {
		// Setup required mocks
		let createOne_mock = jest.fn(({ domain, tenantId, entity }) => Promise.resolve({ fileName: 'new file', type: 'doc', id: 215 }));
		domainController.crudRepo.createOne = createOne_mock;

		// Test functionality
		const res = await request(app)
			.post(`/${configs.api.basePath}/${configs.domain.multiTenantDomains[1]}s`)
			.set('Accept', 'application/json')
			.set('tenantId', 2)
			.send({ fileName: 'FileToBeDelete', type: 'doc' });

		expect(res.statusCode).toBe(HttpStatusCodes.Created);
		expect(res.type).toBe('application/json');
		expect(res.body).toStrictEqual({ created: { fileName: 'new file', type: 'doc', id: 215 } });
	});

	test('deleteOne', async () => {
		// Setup required mocks
		let deleteOne_mock = jest.fn(({ domain, tenantId, id }) => Promise.resolve({ affectedRows: 1 }));
		domainController.crudRepo.deleteOne = deleteOne_mock;

		let createOne_mock = jest.fn(({ domain, tenantId, entity }) => Promise.resolve({ fileName: 'new file', type: 'doc', id: 215 }));
		domainController.crudRepo.createOne = createOne_mock;

		// Setup test data
		const createRes = await request(app)
			.post(`/${configs.api.basePath}/${configs.domain.multiTenantDomains[1]}s`)
			.set('Accept', 'application/json')
			.set('tenantId', 2)
			.send({ fileName: 'FileToBeDelete', type: 'doc' });

		// Test functionality
		const res = await request(app)
			.delete(`/${configs.api.basePath}/${configs.domain.multiTenantDomains[1]}s/215`)
			.set('tenantId', 2)
			.send();
		expect(res.text).toBe(`{"message":"Deleted entity 'mediaFile' with id='215'"}`);
		expect(res.statusCode).toBe(HttpStatusCodes.Ok);
	});

	test('updateOne', async () => {
		// Setup required mocks

		let updateOne_mock = jest.fn(({ domain, tenantId, entity }) => Promise.resolve({ fileName: 'new file', type: 'doc', id: '6' }));
		domainController.crudRepo.updateOne = updateOne_mock;

		let createOne_mock = jest.fn(({ domain, tenantId, entity }) => Promise.resolve({ fileName: 'new file', type: 'doc', id: 6 }));
		domainController.crudRepo.createOne = createOne_mock;

		// Setup test data
		const createRes = await request(app)
			.post(`/${configs.api.basePath}/${configs.domain.multiTenantDomains[1]}s`)
			.set('Accept', 'application/json')
			.set('tenantId', 2)
			.send({ fileName: 'FileToBeDelete', type: 'doc' });

		// Test functionality
		const res = await request(app)
			.put(`/${configs.api.basePath}/${configs.domain.multiTenantDomains[1]}s/215`)
			.set('tenantId', 2)
			.send();
		expect(res.body).toEqual({ created: { fileName: 'new file', type: 'doc', id: '6' } });
		expect(res.statusCode).toBe(HttpStatusCodes.Created);
	});
});
