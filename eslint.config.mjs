export default [{
  files: ['script.js'],
  languageOptions: {
    ecmaVersion: 2022,
    globals: Object.fromEntries(['window', 'document', 'location', 'URL', 'requestAnimationFrame'].map(name => [name, 'readonly']))
  },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': 'error',
    'valid-typeof': 'error'
  }
}];
