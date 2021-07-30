var forEach = require('lodash.forEach');

module.exports = function createOverviewDump() {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function (docs) {
      var overviewDoc = {
        id: 'overview-dump',
        aliases: ['overview-dump'],
        path: 'overview-dump',
        outputPath: 'overview-dump.html',
        modules: [],
      };
      forEach(docs, function (doc) {
        if (doc.docType === 'module') {
          overviewDoc.modules.push(doc);
        }
      });
      docs.push(overviewDoc);
    },
  };
};
