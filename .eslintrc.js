module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  plugins: [
    'html'
  ],
  'rules': {
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'camelcase': 0,
    'semi': 0,
    'comma-dangle': 0,
    'indent': 1,
    'eol-last': 0,
    'no-unused-vars': 1,
    'space-before-function-paren': 0,
    'one-var': 0,
    'no-undef': 0,
  }
}
