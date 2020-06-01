/* istanbul ignore file */
import configDefaults from './configsDefaults.json';
import _ from 'lodash';

// application.properties may take reference on environment variables by preceding a $ sign,
function isEnvVarPlaceholder(attrValue) {
	return attrValue && typeof attrValue === 'string' && attrValue.indexOf('$') >= 0;
}

function isObject(attrValue) {
	return typeof attrValue === 'object';
}

function replaceEnvVarWithValue(attrValue, obj, key, processEnv) {
	let splitted = attrValue.split('|');

	let envName = splitted[0].substr(1);
	obj[key] = processEnv ? processEnv[envName] : process.env[envName];
	if (obj[key] === undefined && splitted.length >= 2) {
		const [, second] = splitted;
		obj[key] = second; //Use default value
	}
}

// that is $DB_USER would be resolved by using the environment variable DB_USER
function resolveChildAttributeEnvVars(obj, processEnv) {
	Object.keys(obj).forEach(key => {
		let attrValue = obj[key];
		if (isObject(attrValue)) {
			resolveChildAttributeEnvVars(attrValue, processEnv);
		} else if (isEnvVarPlaceholder(attrValue)) {
			replaceEnvVarWithValue(attrValue, obj, key, processEnv);
		}
	});
}

// Loads applicationProperties
export const configure = processEnv => {
	let templateClone = _.cloneDeep(configDefaults);
	resolveChildAttributeEnvVars(templateClone, processEnv);
	return templateClone;
};

let configs = configure();
export default configs;
