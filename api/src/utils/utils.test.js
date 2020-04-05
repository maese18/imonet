import { orDefaultNumber, orDefaultString, orDefault } from './utils';

test('tests orDefaultNumber with correct number value', () => {
	let actualNumberValue = orDefaultNumber(12, 100);
	expect(actualNumberValue).toBe(12);
});

test('tests orDefaultNumber with an object provided as value', () => {
	expect(orDefaultNumber({}, 100)).toBe(100);
});

test('tests orDefaultNumber with an object provided as value and an illegal defaultValue. Should throw an error', () => {
	try {
		orDefaultNumber({}, 'whh');
	} catch (e) {
		expect(e.name).toBe('IllegalArgumentException');
	}
});

test('tests if orDefaultNumber returns the value as number if provided as string', () => {
	expect(orDefaultNumber('10292', 100)).toBe(10292);
});

test('tests if orDefaultNumber returns the default value 0 if an undefined value is provided', () => {
	expect(orDefaultNumber(undefined, 0)).toBe(0);
});

test('tests if orDefaultString return the default string', () => {
	expect(orDefaultString(undefined, 'default')).toBe('default');
});

test('tests if orDefaultString return the string in case of a normal string', () => {
	expect(orDefaultString('test', 'default')).toBe('test');
});

test('tests if orDefaultString returns an empty string in case no default is given', () => {
	expect(orDefaultString({})).toBe('');
});

test('orDefault', () => {
	expect(orDefault(undefined, false)).toBe(false);
});
