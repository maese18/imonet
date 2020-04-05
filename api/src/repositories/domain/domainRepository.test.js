import domainRepository from './domainRepository';
import configs from '../../config/configs';
import repositoryUtil from '../utils/repositoryUtil';
describe('DomainRepository tests', () => {
	test('findAllByQuery with unknown domain', done => {
		domainRepository.findAllByQuery({ domain: 'anyStrangeDomain' }).catch(e => {
			expect(e.name).toBe('AuthorizationException');
			done();
		});
	});
	test('findAllByQuery', done => {
		let getAllTableColumnsExceptTenantId_mock = jest.fn((schema, domain, isMultiTenantDomain) => {
			return Promise.resolve(['fileName', 'type', 'id']);
		});
		let executeGetCountConditionally_mock = jest.fn(() => {
			return Promise.resolve({ count: 10 });
		});
		let repositoryUtil_mock = {
			getAllTableColumnsExceptTenantId: getAllTableColumnsExceptTenantId_mock,
			executeGetCountConditionally: executeGetCountConditionally_mock,
		};
		// Inject mock
		domainRepository.repositoryUtil = repositoryUtil_mock;

		let executeNamedPlaceholdersStmt_mock = jest.fn(() => {
			return Promise.resolve({});
		});
		// Inject mock
		domainRepository.dbAdaptor.executeNamedPlaceholdersStmt = executeNamedPlaceholdersStmt_mock;

		domainRepository
			.findAllByQuery({ domain: configs.domain.multiTenantDomains[0], tenantId: 2 })
			.then(result => {
				expect(getAllTableColumnsExceptTenantId_mock.mock.calls[0]).toEqual(['test_db', 'user', true]);
				expect(executeGetCountConditionally_mock.mock.calls[0]).toEqual([false, "SELECT COUNT(*) as count FROM test_db.user WHERE (tenant_id = '2')"]);
				done();
			})
			.catch(e => {
				console.log(e);
				console.log('executeGetCountConditionally_mock', executeGetCountConditionally_mock.mock);
				done();
			});
	});

	test('findOne', done => {
		let mockQuery = jest.fn(stmt => {
			return Promise.resolve({ id: 200, fileName: 'file name', type: 'pdf' });
		});
		let dbMock = {
			getPool: () => {
				return {
					query: mockQuery,
				};
			},
		};
		domainRepository.dbAdaptor = dbMock;
		domainRepository
			.findOne({ domain: configs.domain.multiTenantDomains[0], id: 200 })
			.then(r => {
				expect(r).toStrictEqual({ id: 200, fileName: 'file name', type: 'pdf' });
				expect(mockQuery.mock.calls.length).toBe(1);
				expect(mockQuery.mock.calls[0]).toEqual(["SELECT * FROM test_db.user WHERE (id = '200')", []]);
				done();
			})
			.catch(e => {
				console.log(e);
				done();
			});
	});
});
