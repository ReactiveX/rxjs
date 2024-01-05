import { readFile } from 'fs/promises';
import { parse } from 'yamljs';

import { TreeNodeRaw, build, flattenApiList } from './src/lib';

module.exports = function decisionTreeGenerator(log: { warn: (message: string) => void }) {
  return {
    $runBefore: ['rendering-docs'],
    $runAfter: ['generateApiListDoc'],
    $validate: {
      decisionTreeFile: { presence: true },
      outputFolder: { presence: true },
    },
    $process: async function (this: any, docs: any[]) {
      const apiListDoc = docs.find((doc) => doc.docType === 'api-list-data');

      if (!apiListDoc) {
        throw new Error('Can not find api-list-data for decision tree generation');
      }

      const yamlContent = await readFile(this.decisionTreeFile, { encoding: 'utf8' });
      const decisionTreeJson: TreeNodeRaw[] = parse(yamlContent);

      const flattenedApiList = flattenApiList(apiListDoc.data);
      const jsonContent = build(flattenedApiList, decisionTreeJson, log);

      docs.push({
        docType: 'decision-tree-data',
        template: 'json-doc.template.json',
        path: this.outputFolder + '/decision-tree-data.json',
        outputPath: this.outputFolder + '/decision-tree-data.json',
        data: jsonContent,
      });
      return docs;
    },
  };
};
