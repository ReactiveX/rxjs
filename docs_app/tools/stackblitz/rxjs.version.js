// Exposes the current RxJS version number from the library's package.json
// for usage in TypeScript files.
// (Since said package.json is outside of this TypeScript project, it's not
// available for a direct TypeScript import).

module.exports = require('../../../package.json').version;
