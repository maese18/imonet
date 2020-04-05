import configs from '../config/configs';
import domainTypeService, { MULTI_TENANT_DOMAIN, COMMON_DOMAIN, UNLISTED_DOMAIN } from './domainTypeService';

describe('DomainTypeService tests', () => {
	test('multi-tenant domain is recognized as such from configuration', () => {
		let firstMultiTenantDomain = configs.domain.multiTenantDomains[0];
		expect(domainTypeService.getDomainType(firstMultiTenantDomain)).toBe(MULTI_TENANT_DOMAIN);
	});

	test('common domain is recognized as such from configuration', () => {
		let firstCommonDomain = configs.domain.commonDomains[0];
		expect(domainTypeService.getDomainType(firstCommonDomain)).toBe(COMMON_DOMAIN);
	});

	test('unlisted domain is recognized as such from configuration', () => {
		expect(domainTypeService.getDomainType('any_unknown_domain')).toBe(UNLISTED_DOMAIN);
	});
});
