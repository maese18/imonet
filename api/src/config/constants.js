export const AUTH_TYPES = {
	AUTHORIZED: 'authorized',
	NO_AUTH_WHEN_OPTIONALLY_AUTHORIZED: 'noAuthWhenOptionallyAuthorized',
	OPTIONALLY_AUTHORIZED: 'optionallyAuthorized',
};
export const VISIBILITY = {
	PUBLIC: 'public',
	PRIVATE: 'private',
	RESTRICTED: 'restricted',
};

export const GROUPS = {
	'1': { name: 'anonymous' },
	'2': { name: 'individual' },
	'3': { name: 'tenantUser' },
	'4': { name: 'tenantSuperUser' },
	anonymous: { id: 1, name: 'anonymous' },
	individual: { id: 2, name: 'individual' },
	individualWithGrantedPermission: { id: 3, name: 'individualWithGrantedPermission' },
	tenantUser: { id: 4, name: 'tenantUser' },
	tenantSuperUser: { id: 5, name: 'tenantSuperUser' },
};
