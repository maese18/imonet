/* istanbul ignore file */
import IllegalArgumentException from '../errors/IllegalArgumentException';

export function sleep(milliseconds) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, milliseconds);
	});
}
// Returns the number value of the parameter value if it is or can be converted to a number.
// Otherwise the defaultValue is returned.
export const orDefaultNumber = (value, defaultValue) => {
	let out;
	try {
		out = Number(value);
		if (isNaN(out)) {
			out = Number(defaultValue);
		}
	} catch (valueErr) {
		console.log('valueErr=', valueErr);
	}

	if (isNaN(out)) {
		throw new IllegalArgumentException('utils', `defaultValue '${defaultValue}' is undefined or not a number`, 'undefined default value');
	}

	return out;
};

export const orDefaultString = (value, defaultValue = '') => {
	if (value && typeof value === 'string') {
		return value;
	}
	return defaultValue;
};

export const orDefault = (value, defaultValue) => {
	if (value === undefined) {
		return defaultValue;
	}
	return value;
};
export const stringify = o => JSON.stringify(o, null, 2);

export const stringifyNoWrap = o => JSON.stringify(o);
