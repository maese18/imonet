import {
	buildResponseObject,
	getDomain,
	getFilterArguments,
	getPaginationArguments,
	getSortArgs,
	getRequestedAttributes,
	getTenantId,
	getMultiTenancyFilter,
	getAllRequestArguments,
	formatResponse,
} from './controllerUtil';
import IllegalArgumentException from '../../errors/IllegalArgumentException';
import configs from '../../config/configs';
describe('controllerUtils tests', () => {
	test('getPageAndSortArguments retrieves corrects page and sorting arguments from the request object', () => {
		let query = { pageNum: 1, pageSize: 20 };
		let pagingAndSortingArgs = getPaginationArguments(query);
		expect(pagingAndSortingArgs).toStrictEqual({
			hasPagination: true,
			pageNum: 1,
			pageSize: 20,
		});
	});

	test('getPageAndSortArguments retrieves hasPagination=false object when neither pageNum nor pageSize are given', () => {
		let query = {};
		let pagingAndSortingArgs = getPaginationArguments(query);
		expect(pagingAndSortingArgs).toStrictEqual({
			hasPagination: false,
		});
	});

	test('getPageAndSortArguments retrieves correct object when pageNum or pageSize are unset', () => {
		let query = { pageSize: 10 };
		let pagingAndSortingArgs = getPaginationArguments(query);
		expect(pagingAndSortingArgs).toStrictEqual({
			hasPagination: true,
			pageNum: 0,
			pageSize: 10,
		});
	});

	test('getSortArgs with no sort args query', () => {
		let query = {};
		expect(getSortArgs(query)).toStrictEqual([]);
	});

	test('getSortArgs', () => {
		let query = { sort: ' name, ,-firstName' };
		expect(getSortArgs(query)).toStrictEqual(['name', '-firstName']);
	});

	test('getRequestedAttributes', () => {
		let query = { attributes: 'id, name' };
		expect(getRequestedAttributes(query)).toStrictEqual(['id', 'name']);
	});

	test('getDomain retrieves right domain name and its plural', () => {
		let req = { params: { domainPlural: 'tests' } };
		let { domain, domainPlural } = getDomain(req);
		expect(domain).toBe('test');
		expect(domainPlural).toBe('tests');
	});

	test('getDomain when no domain is defined ', () => {
		let req = { params: {} };

		expect(() => getDomain(req)).toThrow(Error);
	});
	test('getFilterArguments', () => {
		expect(getFilterArguments({ filters: 'id.eq(100)' })).toStrictEqual(['id.eq(100)']);
		expect(getFilterArguments(undefined)).toStrictEqual([]);
	});

	test('getTenantId() if request contains decodedToken object', () => {
		let req = { decodedToken: { client_id: 2 } };
		expect(getTenantId(req)).toBe(2);
	});

	test('getTenantId() if request does not contain decodedToken object', () => {
		let req = { headers: { 'tenant-id': 2 } };
		req.get = function() {
			return req.headers['tenant-id'];
		};
		expect(getTenantId(req)).toBe(2);
	});

	test('getMultiTenancyFilter(domain, req)', () => {
		let domain = configs.domain.multiTenantDomains[0];
		let req = { headers: { 'tenant-id': 2 } };
		req.get = function() {
			return req.headers['tenant-id'];
		};
		expect(getMultiTenancyFilter(domain, req)).toBe('client_id.eq(2)');
	});

	test('getMultiTenancyFilter(domain, req) for an unknown domain throws exception', () => {
		let domain = 'unknownDomain';
		let req = { headers: { 'tenant-id': 2 } };
		req.get = function() {
			return req.headers['tenant-id'];
		};

		expect(() => getMultiTenancyFilter(domain, req)).toThrow(IllegalArgumentException);
	});

	test('getMultiTenancyFilter(domain, req) for whitelisted domain (but no tenant domain) returns false', () => {
		let domain = configs.domain.commonDomains[0];
		let req = { headers: { 'tenant-id': 2 } };
		req.get = function() {
			return req.headers['tenant-id'];
		};

		expect(getMultiTenancyFilter(domain, req)).toBe(false);
	});
	test('getAllRequestArguments', () => {
		let req = {
			params: { domainPlural: configs.domain.multiTenantDomains[0] + 's' },
			query: { sort: 'name,-firstName' },
			headers: { 'tenant-id': 2 },
		};
		req.get = function() {
			return req.headers['tenant-id'];
		};
		let resp = getAllRequestArguments(req);
		expect(getAllRequestArguments(req)).toStrictEqual({
			domain: configs.domain.multiTenantDomains[0],
			domainPlural: configs.domain.multiTenantDomains[0] + 's',
			tenantId: 2,
			multiTenancyFilter: 'client_id.eq(2)',
			attributes: [],
			paginationArgs: { hasPagination: false },
			sort: ['name', '-firstName'],
			filters: [],
		});
	});

	test('getAllRequestArguments in case query is undefined', () => {
		let req = {
			params: { domainPlural: configs.domain.multiTenantDomains[0] + 's' },
			headers: { 'tenant-id': 2 },
		};
		req.get = function() {
			return req.headers['tenant-id'];
		};

		let resp = getAllRequestArguments(req);
		expect(getAllRequestArguments(req)).toStrictEqual({
			domain: configs.domain.multiTenantDomains[0],
			domainPlural: configs.domain.multiTenantDomains[0] + 's',
			tenantId: 2,
			multiTenancyFilter: 'client_id.eq(2)',
			attributes: [],
			paginationArgs: { hasPagination: false },
			sort: [],
			filters: [],
		});
	});

	test('tests buildPagingAndSortingResponse returns correct when providing attributes selection only', () => {
		let req = { headers: {}, query: {} };
		let responseObject = {
			totalItemsCount: 10,
			verifiedAttributes: 'fileName,id,type',
			data: [],
		};
		let response = buildResponseObject(
			req,
			{
				domainPlural: 'document_files',
				attributes: ['id', 'fileName'],
				resultObject: {},
			},
			responseObject
		);
		//console.log(`providing attributes =${JSON.stringify(response, null, 2)}`);
		expect(response).toStrictEqual({
			data: [],
			query: {},
			self: '/api/document_files?attributes=id,fileName',
		});
	});

	test('tests buildPagingAndSortingResponse returns correct response object', () => {
		let req = { headers: {}, query: {} };
		let responseObject = {
			totalItemsCount: 180,
			verifiedAttributes: '*',
			data: [],
		};
		let response = buildResponseObject(
			req,
			{
				domainPlural: 'document_files',
				paginationArgs: { hasPagination: true, pageNum: 1, pageSize: 5 },
				filters: [],
				totalItemsCount: 180,
			},
			responseObject
		);
		expect(response).toStrictEqual({
			query: {},
			data: [],
			pagination: {
				totalItems: 180,
				pageNum: 1,
				pageSize: 5,
				first: '/api/document_files?pageNum=0&pageSize=5',
				last: '/api/document_files?pageNum=35&pageSize=5',
				previous: '/api/document_files?pageNum=0&pageSize=5',
				next: '/api/document_files?pageNum=2&pageSize=5',
			},
			self: '/api/document_files?pageNum=1&pageSize=5',
		});
	});

	test('tests buildPagingAndSortingResponse returns correct response object with sorting', () => {
		let req = { headers: {}, query: { filters: [] } };
		let responseObject = {
			totalItemsCount: 180,
			verifiedAttributes: '*',
			data: [],
		};
		let response = buildResponseObject(
			req,
			{
				domainPlural: 'document_files',
				sort: ['lastName', '-firstName'],
				paginationArgs: { hasPagination: true, pageNum: 1, pageSize: 5 },
				filters: [],
				totalItemsCount: 180,
			},
			responseObject
		);

		expect(response).toStrictEqual({
			query: {
				filters: [],
			},
			data: [],
			pagination: {
				totalItems: 180,
				pageNum: 1,
				pageSize: 5,
				first: '/api/document_files?sort=lastName,-firstName&pageNum=0&pageSize=5',
				last: '/api/document_files?sort=lastName,-firstName&pageNum=35&pageSize=5',
				previous: '/api/document_files?sort=lastName,-firstName&pageNum=0&pageSize=5',
				next: '/api/document_files?sort=lastName,-firstName&pageNum=2&pageSize=5',
			},
			self: '/api/document_files?sort=lastName,-firstName&pageNum=1&pageSize=5',
		});
	});

	test('formatResponse', () => {
		let req = { query: { prettyFormat: 'true' } };
		let responseObject = { anyResponse: 'msg' };
		expect(formatResponse(req, responseObject)).toBe(JSON.stringify(responseObject, null, 2));

		req = { query: { prettyFormat: 'false' } };
		expect(formatResponse(req, responseObject)).toBe(responseObject);
	});
	/*
    test('tests getPageAndSortArguments retrieves corrects page and sorting arguments from the request object', t => {
        let query = {pageNum: 1, pageSize: 20};
        let pagingAndSortingArgs = getPaginationArguments(query);
        t.deepEqual(pagingAndSortingArgs, {
            hasPagination: true,
            pageNum: 1,
            pageSize: 20,
        });
        t.end();
    });

    test('tests getPageAndSortArguments retrieves correct default page and sorting arguments from the request object', t => {
        let query = {};
        let pagingAndSortingArgs = getPaginationArguments(query);
        t.deepEqual(pagingAndSortingArgs, {
            hasPagination: false,
            pageNum: 0,
            pageSize: configs.api.defaults.pageSize,
        });
        t.end();
    });

   
    
    test('parseSortArgs', t => {
        t.deepEqual(parseSortArgs({}), [], 'no sort arg should return empty array');
        t.deepEqual(
            parseSortArgs({sort: ''}),
            [],
            'empty sort arg should return empty array',
        );
        t.deepEqual(
            parseSortArgs({sort: 'id'}),
            ['id asc'],
            'single array item with field name, space and sort direction should be returned in case of one field in sort arg',
        );
        t.deepEqual(parseSortArgs({sort: 'id,-name'}), ['id asc', 'name desc']);
        t.deepEqual(parseSortArgs({sort: '+id,-name'}), ['id asc', 'name desc']);
        t.deepEqual(
            parseSortArgs({sort: '- id,-name'}),
            ['id desc', 'name desc'],
            'spaces between +/- and field names should be eliminated.',
        );
        t.deepEqual(parseSortArgs(undefined), [], 'undefined query object');
        t.end();
    });

   
    */
});
