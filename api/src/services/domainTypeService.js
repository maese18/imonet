import configs from '../config/configs';
export const MULTI_TENANT_DOMAIN = 'mutliTenantDomain';
export const COMMON_DOMAIN = 'commonDomain';
export const UNLISTED_DOMAIN = 'unlistedDomain';

class DomainTypeService {
	constructor() {
		this.configs = configs;
	}
	/**
	 * Returns multiTenantDomain if the domain is a multi-tenant-capable domain, commonDomain if it is a common, not-multi-tenant-capable domain or
	 * undefined if the domain is not known.
	 * @param domain
	 * @returns {*}
	 */
	getDomainType(domain) {
		let isCommonDomain = configs.domain.commonDomains.indexOf(domain) >= 0;
		if (isCommonDomain) return COMMON_DOMAIN;
		let isMutliTenantDomain = configs.domain.multiTenantDomains.indexOf(domain) >= 0;
		if (isMutliTenantDomain) return MULTI_TENANT_DOMAIN;
		return UNLISTED_DOMAIN;
	}
	isRegisteredDomain(domain) {
		return this.getDomainType(domain) !== UNLISTED_DOMAIN;
	}

	isMultiTenantDomain(domain) {
		return this.getDomainType(domain) === MULTI_TENANT_DOMAIN;
	}

	isCommonDomain(domain) {
		return this.getDomainType(domain) === COMMON_DOMAIN;
	}
}
let domainTypeService = new DomainTypeService();
export default domainTypeService;
