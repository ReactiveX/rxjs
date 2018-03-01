const Dgeni = require('dgeni').Dgeni;
const rxjsDocsPackage = require('./rxjs-docs-package');

const dgeni = new Dgeni([rxjsDocsPackage]);

dgeni.generate().then(
  results => {
    console.log(`Docs generation complete. ${results.length} docs generated`);
  },
  error => { console.log(`Doc generation failed - ${error}`)}
);