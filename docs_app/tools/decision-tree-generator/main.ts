import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'yamljs';
import { ApiListNode, build, flattenApiList, TreeNodeRaw } from './src/lib';
const generatedBase = resolve(`${__dirname}/../../src/generated/docs`);
const outFilename = `${generatedBase}/app/decision-tree-data.json`;
const yamlContent = readFileSync(`${__dirname}/src/tree.yml`, 'utf8');
const decisionTreeJson: TreeNodeRaw[] = parse(yamlContent);
let apiList: ApiListNode[];

try {
  apiList = JSON.parse(
    readFileSync(`${generatedBase}/api/api-list.json`, 'utf8')
  );
} catch (error) {
  console.log(
    chalk.red('Decision Tree Generator - error:'),
    'Generating the decision tree requires the generated API list. Please run `npm run docs` and try again.'
  );
}

try {
  const flattenedApiList = flattenApiList(apiList);
  const jsonContent = build(flattenedApiList, decisionTreeJson);
  writeFileSync(outFilename, JSON.stringify(jsonContent, null, '  '), 'utf8');
  console.log(
    chalk.green('Decision Tree Generator - success:'),
    'Finished generating decision tree'
  );
} catch (error) {
  console.log(chalk.red('Decision Tree Generator - error:'), error.message);
}
