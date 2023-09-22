module.exports = function generateDeprecationListDoc() {

  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    outputFolder: null,
    $process: function(docs) {
      docs.push({
        docType: 'deprecation',
        template: 'json-doc.template.json',
        path: this.outputFolder + '/deprecations',
        outputPath: this.outputFolder + '/deprecations.json',
        data: docs
          .filter(doc => doc.deprecated)
          .map(doc => {
            return {
              name: doc.name,
              type: doc.docType,
              path: doc.path,
              text: doc.deprecated
            };
          })
      });
    }
  };
};