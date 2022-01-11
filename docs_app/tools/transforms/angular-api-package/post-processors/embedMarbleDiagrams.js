const fs = require('fs');
const path = require('path');
const visit = require('unist-util-visit');
const is = require('hast-util-is-element');

/**
 * Find pre-rendered marble diagrams and override their <img> `src` attributes in docs.
 */
module.exports = function embedMarbleDiagramsPostProcessor() {
  const service = {
    marbleImagesPath: null,
    marbleImagesOutputWebPath: null,
    process: () => {
      return (tree) => {
        visit(tree, node => {
          if (is(node, 'img')) {
            const props = node.properties;
            const src = props.src;
            const expectedImgPath = `${service.marbleImagesPath}/${src}`;
            if (fs.existsSync(expectedImgPath)) {
              const operator = path.basename(src, path.extname(src));
              const filename = path.basename(expectedImgPath);

              props.src = `${service.marbleImagesOutputWebPath}/${filename}`;
              props.width = '100%';
              if (!props.alt) {
                props.alt = `${operator} marble diagram`;
              }
            }
          }
        });
      };
    },
  };

  return service;
};
