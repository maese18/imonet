module.exports = {
  root: true,
  env: {
    node: true,
  },
  //extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],

  env: {
    es6: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  extends: ['plugin:vue/recommended', 'plugin:prettier/recommended', 'eslint:recommended'],
  globals: {
    _: true,
    moment: true,
    $toast: true,
    firebase: true,
    module: true,
    swal: true,
    atatus: true,
    Tawk_API: true,
    Stripe: true,
  },
  rules: {
    'array-bracket-spacing': [2, 'never'],
    'no-var': 2,
    'block-scoped-var': 2,
    'brace-style': [2, '1tbs'],
    camelcase: 1,
    'computed-property-spacing': [2, 'never'],
    curly: 2,
    'eol-last': 2,
    eqeqeq: [2, 'smart'],
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        MemberExpression: 1,
      },
    ],
    'max-depth': [1, 3],
    'max-len': [1, 120],
    'max-statements': [1, 45],
    'new-cap': 1,
    'no-extend-native': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-trailing-spaces': 2,
    'no-unused-vars': 2,
    'object-curly-spacing': [2, 'always'],
    quotes: [2, 'single', 'avoid-escape'],
    semi: [2, 'always'],
    'arrow-spacing': [2, { before: true, after: true }],
    'keyword-spacing': [2, { before: true, after: true }],
    'space-unary-ops': 2,
    'comma-dangle': ['error', 'always-multiline'],
    'prefer-arrow-callback': 2,
    'vue/html-quotes': 'single',

    'vue/max-attributes-per-line': [
      2,
      {
        singleline: 20,
        multiline: {
          max: 1,
          allowFirstLine: false,
        },
      },
    ],
  },
};
