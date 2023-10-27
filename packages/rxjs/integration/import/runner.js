const path = require('path');
const { exec } = require('child_process');
const projectRoot = process.cwd();
const rxjsRoot = path.join(__dirname, '../../');
const fixturesDirectory = path.join(__dirname, 'fixtures');
const rxjsVersion = require(path.join(rxjsRoot, 'package.json')).version;
const tgzPath = path.join(rxjsRoot, `rxjs-${rxjsVersion}.tgz`);

const FIXTURES = ['commonjs', 'esm'];

/**
 * Runs a command in the shell
 * @param {string} cmd
 * @returns {Promise<void>}
 */
function execAsync(cmd, cwd = projectRoot) {
  return new Promise((resolve, reject) => {
    console.log(`${cwd}$ ${cmd}`);
    exec(cmd, { cwd }, (code, stdout, stderr) => {
      if (code !== 0 && code !== null) {
        reject({ std: stderr, code });
      } else {
        resolve({ std: stdout, code });
      }
    });
  });
}

// Should return the .tgz file path
async function buildAndPackageRxJS() {
  await execAsync('yarn build && npm pack', rxjsRoot);
}

async function cleanUp(fixturePath) {
  try {
    await execAsync('yarn remove rxjs', fixturePath);
    await execAsync('rm -rf ./node_modules ./package-lock.json ./yarn.lock', fixturePath);
  } catch (err) {
    console.warn('fixtured not cleaned up', err);
  }
}

async function main() {
  try {
    console.log('Building and packaging RxJS...');
    try {
      await buildAndPackageRxJS();
    } catch (err) {
      console.error('❌ Failed to build and package RxJS!');
      console.error(err);
      throw err;
    }

    const failedFixtures = [];

    for (const fixtureName of FIXTURES) {
      const fixturePath = path.join(fixturesDirectory, fixtureName);
      try {
        console.log(`Running ${fixtureName}...`);
        console.log(`Installing ${tgzPath}...`);
        await execAsync(`yarn install && yarn add ${tgzPath}`, fixturePath);
        console.log(`Running tests...`);
        await execAsync('yarn test', fixturePath);
        console.log(`✅ ${fixtureName} import test passed!`);
      } catch (err) {
        console.error(`❌ ${fixtureName} import test failed!`);
        console.error(err);
        failedFixtures.push(fixtureName);
      } finally {
        await cleanUp(fixturePath);
      }
    }

    if (failedFixtures.length) {
      throw new Error(`${failedFixtures.length} fixture(s) failed!`);
    }
  } finally {
    await execAsync(`rm ${tgzPath}`, projectRoot);
  }
}

main();
