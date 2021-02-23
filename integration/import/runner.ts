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

import * as rx_export_src from 'rxjs';
import * as operators_export_src from 'rxjs/operators';

const writeFileAsync = promisify(fs.writeFile);
const projectRoot = process.cwd();
const { version } = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));

const execPromise = (cmd: string, cwd = projectRoot) =>
  new Promise((resolve, reject) =>
    exec(cmd, { cwd }, (code, stdout, stderr) => {
      if (code !== 0) {
        reject({ std: stderr, code });
      } else {
        resolve({ std: stdout, code });
      }
    }));

const main = async () => {
  // create local pkgs
  await execPromise('npm run build:package');
  await execPromise('npm pack');

  const pkgPath = path.join(projectRoot, `rxjs-${version}.tgz`);

  
  rm('-rf', path.join(__dirname, 'node_modules'));
  rm('-rf', path.join(__dirname, 'rx.json'));
  rm('-rf', path.join(__dirname, 'operators.json'));
  
  // create snapShot from existing src's export site
  writeFileAsync(path.join(__dirname, 'rx.json'), JSON.stringify(Object.keys(rx_export_src)));
  writeFileAsync(path.join(__dirname, 'operators.json'), JSON.stringify(Object.keys(operators_export_src)));
  
  await execPromise(`npm install ${pkgPath} --no-save`, __dirname);
  await execPromise('npm test', __dirname);
};

main().catch((err) => {
  console.log('test failed');
  console.log(err);
  throw err;
});