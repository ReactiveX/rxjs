const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const projectRoot = process.cwd();
const rxjsRoot = path.join(__dirname, '../../');
const rxjsObservableRoot = path.join(__dirname, '../../../observable');
const fixturesDirectory = path.join(__dirname, 'fixtures');
const rxjsVersion = require(path.join(rxjsRoot, 'package.json')).version;
const tgzPath = path.join(rxjsRoot, `rxjs-${rxjsVersion}.tgz`);
const rxjsObservableTgzPath = path.join(rxjsObservableRoot, `rxjs-observable-${rxjsVersion}.tgz`);

// These are the fixtures to run the import test against
// they map to directories in the fixtures directory
const FIXTURES = [
  //
  'commonjs',
  'esm',
  'browser',
  'vite-bundle',
  'webpack-bundle',
];

/**
 * Executes a command in a child process and streams the output to the console
 * @param {string} cmd The command to execute
 * @param {string} cwd The working directory to execute the command in
 * @returns a promise that resolves when the command completes
 */
function execAsync(cmd, cwd = '.') {
  return new Promise((resolve, reject) => {
    console.log(`${cwd}$ ${cmd}`);

    // Split the cmd into base command and arguments for spawn
    const [command, ...args] = cmd.split(' ');
    const child = spawn(command, args, { cwd, shell: true });

    // Stream child process stdout to the console
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    // Stream child process stderr to the console
    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve({ code });
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  try {
    console.log('Building and packaging @rxjs/observable...');
    try {
      await execAsync('yarn build && npm pack', rxjsObservableRoot);
    } catch (err) {
      console.error('❌ Failed to build and package @rxjs/observable!');
      console.error(err);
      throw err;
    }
    console.log('Building and packaging RxJS...');
    try {
      await execAsync('yarn build && npm pack', rxjsRoot);
    } catch (err) {
      console.error('❌ Failed to build and package RxJS!');
      console.error(err);
      throw err;
    }

    // We want to allow all of the fixtures to run, so we don't want to throw
    // instead we want to collect the failed fixtures and throw at the end
    const failedFixtures = [];

    for (const fixtureName of FIXTURES) {
      const fixturePath = path.join(fixturesDirectory, fixtureName);

      try {
        console.log('\n');
        console.log(`Running ${fixtureName}...`);

        console.log('Setting custom dependency resolution for local @rxjs/observable...');
        addYarnResolution(fixturePath, '@rxjs/observable', `file:${path.relative(fixturePath, rxjsObservableTgzPath)}`);

        await execAsync(`yarn install && yarn add ${tgzPath}`, fixturePath);
        await execAsync('yarn test', fixturePath);
        console.log(`✅ ${fixtureName} import test passed!`);
      } catch (err) {
        console.error(`❌ ${fixtureName} import test failed!`);
        console.error(err);

        // This fixture failed, so add it to the failed fixtures list
        failedFixtures.push(fixtureName);
      } finally {
        try {
          await execAsync('yarn remove rxjs', fixturePath);
          await execAsync('rm -rf ./node_modules ./package-lock.json ./yarn.lock', fixturePath);
          removeYarnResolution(fixturePath, '@rxjs/observable');
        } catch (err) {
          console.warn('fixtured not cleaned up', err);
        }
      }
    }

    if (failedFixtures.length) {
      // If any of the fixtures failed, throw an error
      throw new Error(`${failedFixtures.length} fixture(s) failed!`);
    }
  } finally {
    await execAsync(`rm ${tgzPath}`, projectRoot);
    await execAsync(`rm ${rxjsObservableTgzPath}`, rxjsObservableRoot);
  }
}

main();

function addYarnResolution(fixturePath, name, version) {
  const fixturePackageJson = fs.readFileSync(path.join(fixturePath, 'package.json'));
  const fixturePackageJsonObj = JSON.parse(fixturePackageJson);
  fixturePackageJsonObj.resolutions = fixturePackageJsonObj.resolutions || {};
  fixturePackageJsonObj.resolutions[name] = version;
  fs.writeFileSync(path.join(fixturePath, 'package.json'), JSON.stringify(fixturePackageJsonObj, null, 2));
}

function removeYarnResolution(fixturePath, name) {
  const fixturePackageJson = fs.readFileSync(path.join(fixturePath, 'package.json'));
  const fixturePackageJsonObj = JSON.parse(fixturePackageJson);
  delete fixturePackageJsonObj.resolutions[name];
  if (!Object.keys(fixturePackageJsonObj.resolutions).length) {
    delete fixturePackageJsonObj.resolutions;
  }
  fs.writeFileSync(path.join(fixturePath, 'package.json'), JSON.stringify(fixturePackageJsonObj, null, 2) + '\n');
}
