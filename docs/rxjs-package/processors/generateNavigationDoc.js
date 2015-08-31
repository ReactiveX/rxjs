var _ = require('lodash');

module.exports = function generateNavigationDoc() {

  return {
    $runAfter: ['docs-processed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {
     console.log(docs.length)
      var modulesDoc = {
        value: { sections: [] },
        moduleName: 'navigation-modules',
        serviceName: 'MODULES',
        template: 'data-module.template.js',
        outputPath: 'js/navigation-modules.js'
      };

      _.forEach(docs, function(doc) {
        if ( doc.docType === 'module' ) {
          var moduleNavItem = {
            path: doc.path,
            partial: doc.outputPath,
            name: doc.id,
            type: 'module',
            pages: []
          };

          modulesDoc.value.sections.push(moduleNavItem);

          _.forEach(doc.exports, function(exportDoc) {
            if(exportDoc.default){
              console.log('default!')
            }
            else if (!exportDoc.private) {
              var exportNavItem = {
                path: exportDoc.path,
                partial: exportDoc.outputPath,
                name: exportDoc.name,
                type: exportDoc.docType
              };
              moduleNavItem.pages.push(exportNavItem);
            }
          });
        }
      });

      docs.push(modulesDoc);


      var guidesDoc = {
        value: { pages: [] },
        moduleName: 'navigation-guides',
        serviceName: 'GUIDES',
        template: 'data-module.template.js',
        outputPath: 'js/navigation-guides.js'
      };

      _.forEach(docs, function(doc) {
        if ( doc.docType === 'guide' ) {
          var guideDoc = {
            path: doc.path,
            partial: doc.outputPath,
            name: doc.name,
            type: 'guide'
          };
          guidesDoc.value.pages.push(guideDoc);
        }
      });
      docs.push(guidesDoc);
    }
  };
};
