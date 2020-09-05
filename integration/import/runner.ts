/**
 * Import site integration test runner.
 *
 * package.json allows to specify properties for modules across
 * commonjs, esm and few other fields used by bundler (i.e `module`)
 * As it expands, there are possibility either properties are not set correctly,
 * or other properties makes different behavior to another loader. For example,
 * specifying native esm for node.js can possibly cause breaking changes to commonjs:
 * https://medium.com/javascript-in-plain-english/is-promise-post-mortem-cab807f18dcc
 *
 * This test runner creates local package to code to be tested, then try to validate
 * each import site we supports to ensure those breaking changes will not occur when
 * new version's being published.
 */
import * as path from 'path';
import { exec, rm } from 'shelljs';
import { promisify } from 'util';
import * as fs from 'fs';

import * as rx_export_src from '../../src/index';
import * as operators_export_src from '../../src/operators/index';

const writeFileAsync = promisify(fs.writeFile);
const projectRoot = process.cwd();
const { version } = require(path.join(projectRoot, 'package.json'));

const execPromise = (cmd: string, cwd = projectRoot) =>
  new Promise((resolve, reject) =>
    exec(cmd, { cwd }, (code, stdout, stderr) => {
      if (code !== 0) {
        reject({ std: stderr, code });
      } else {
        resolve({ std: stdout, code });
      }
    }));

enum IMPORT_TYPE {
  COMMONJS = 'commonjs'
}

const prepareFixture = async (pkgPath: string, fixturePath: string) => {
  rm('-rf', path.join(fixturePath, 'node_modules'));
  rm('-rf', path.join(fixturePath, 'rx.json'));
  rm('-rf', path.join(fixturePath, 'operators.json'));

  // create snapShot from existing src's export site
  writeFileAsync(path.join(fixturePath, 'rx.json'), JSON.stringify(Object.keys(rx_export_src)));
  writeFileAsync(path.join(fixturePath, 'operators.json'), JSON.stringify(Object.keys(operators_export_src)));

  await execPromise(`npm install ${pkgPath} --no-save`, fixturePath);
};

const main = async () => {
  // create local pkgs
  await execPromise('npm run build:package');
  await execPromise('npm pack');

  const pkgPath = path.join(projectRoot, `rxjs-${version}.tgz`);

  // install local pkg to each fixture path, run test scripts
  for (const key in IMPORT_TYPE) {
    const value = (IMPORT_TYPE as any)[key];
    const fixturePath = path.join(__dirname, 'fixtures', value);

    await prepareFixture(pkgPath, fixturePath);
    await execPromise('npm test', fixturePath);
  }
};

main().catch((err) => {
  console.log('test failed');
  console.log(err);
  throw err;
});