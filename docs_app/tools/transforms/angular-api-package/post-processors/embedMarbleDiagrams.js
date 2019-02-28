const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const visit = require('unist-util-visit');
const is = require('hast-util-is-element');

/**
 * Find pre-rendered marble diagrams and override their <img> `src` attributes in docs.
 * You need to run `npm run tests2png` in rxjs root to generate marble diagrams into `tmp/docs/img`
 */
module.exports = function embedMarbleDiagramsPostProcessor(log) {
  const service = {
    marbleImagesPath: null,
    marbleImagesOutputPath: null,
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
              const targetPath = `${service.marbleImagesOutputPath}/${filename}`;

              mkdirp.sync(path.dirname(targetPath));
              fs.copyFileSync(expectedImgPath, targetPath);

              props.src = `${service.marbleImagesOutputWebPath}/${filename}`;
              props.width = '100%';
              if (!props.alt) {
                props.alt = `${operator} marble diagram`;
              }

              log.debug(`Found ${expectedImgPath} and copying it to ${targetPath}`);
            }
          }
        });
      };
    },
  };

  return service;
};
