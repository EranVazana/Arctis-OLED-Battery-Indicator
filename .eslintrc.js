module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
	extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'prettier/@typescript-eslint'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	rules: {
		'prettier/prettier': 'error',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'error',
		'@typescript-eslint/no-empty-function': 'warn',
		'@typescript-eslint/unbound-method': 'off',
		'@typescript-eslint/type-annotation-spacing': 'warn',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-this-alias': 'warn',
		'@typescript-eslint/ban-types': 'warn',
		'@typescript-eslint/explicit-member-accessability': [
			'warn',
			{
				accessability: 'explicit',
				overrides: {
					accessors: 'explicit',
					constructor: 'no-public',
					method: 'explicit',
					properties: 'off',
					parameterProperties: 'explicit',
				},
			},
		],
		'@typescript-eslint/inteface-name-prefix': [
			'warn',
			{
				prefixWithI: 'always',
			},
		],
		'function-call-argument-newline': ['error', 'consistant'],
		'max-len': [
			'warn',
			{
				code: 150,
				ignoreUrls: true,
			},
		],
		'no-confusing-arrow': [
			'error',
			{
				allowParens: false,
			},
		],
		'no-mixed-operators': 'warn',
	},
};
