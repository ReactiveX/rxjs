module.exports = function createOverviewDump() {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process(docs) {
      var overviewDoc = {
        id: 'overview-dump',
        aliases: ['overview-dump'],
        path: 'overview-dump',
        outputPath: 'overview-dump.html',
        modules: [],
      };
      for (const doc of docs) {
        if (doc.docType === 'module') {
          overviewDoc.modules.push(doc);
        }
      }
      docs.push(overviewDoc);
    },
  };
};
