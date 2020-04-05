module.exports = {
	env: {
		es6: true,
		node: true,
		jest: true,
	},
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: 'babel-eslint',
	parserOptions: {
		parser: 'babel-eslint',
		ecmaVersion: 6,
		sourceType: 'module',
	},

	extends: ['eslint:recommended', 'prettier'],
	plugins: ['prettier'],
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'prettier/prettier': 'error',
	},

	overrides: [
		{
			files: [
				'**/__tests__/*.{j,t}s?(x)',
				'**/tests/unit/**/*.spec.{j,t}s?(x)',
			],
		},
	],
}
