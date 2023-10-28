const path = require('path');
const { spawn } = require('child_process');
const projectRoot = process.cwd();
const rxjsRoot = path.join(__dirname, '../../');
const fixturesDirectory = path.join(__dirname, 'fixtures');
const rxjsVersion = require(path.join(rxjsRoot, 'package.json')).version;
const tgzPath = path.join(rxjsRoot, `rxjs-${rxjsVersion}.tgz`);

const FIXTURES = ['commonjs', 'esm', 'browser'];

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
