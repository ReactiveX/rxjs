import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const testPath = 'dom/observable/tentative';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const wptDir = path.join(__dirname, '.wpt');
const polyfillScriptPath = path.resolve(__dirname, '../dist/esm/polyfill.js');

console.log(bold(wptDir));

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    // We also want to make sure we log the output from the subprocess
    const subprocess = spawn(command, args, { stdio: 'inherit', ...options });

    subprocess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      }
    });

    // Log output from the subprocess
    subprocess.stdout?.on('data', (data) => {
      console.log(data.toString());
    });

    subprocess.stderr?.on('data', (data) => {
      console.error(data.toString());
    });

    // Be sure that if the main process is killed, the subprocess is also killed
    process.on('SIGINT', () => {
      if (subprocess.exitCode === null) subprocess.kill();
    });
  });
}

/**
 * Uses git to clone the WPT repository into the .wpt directory
 * if it doesn't already exist.
 *
 * If it does exist, it pulls the latest changes.
 */
async function ensureWPTRepo() {
  if (!fs.existsSync(wptDir)) {
    console.log('Cloning WPT repository...');
    await runCommand('git', ['clone', 'https://github.com/web-platform-tests/wpt.git', wptDir]);
  } else {
    console.log('WPT repository already exists. Pulling latest changes...');
    await runCommand('git', ['pull'], { cwd: wptDir });
  }
}

let unhandledErrors = null;

process.on('unhandledRejection', (error) => {
  unhandledErrors ??= [];
  unhandledErrors.push(error);
});

process.on('uncaughtException', (error) => {
  unhandledErrors ??= [];
  unhandledErrors.push(error);
});

const testHarnessScriptPath = path.join(wptDir, 'resources', 'testharness.js');
const testHarnessScript = fs.readFileSync(testHarnessScriptPath, 'utf8');

let _self;
let _window;
let _addEventListener;
let _removeEventListener;
let _dispatchEvent;

function beforeEach() {
  unhandledErrors = null;
  _self = globalThis.self;
  _window = globalThis.window;
  _addEventListener = globalThis.addEventListener;
  _removeEventListener = globalThis.removeEventListener;
  _dispatchEvent = globalThis.dispatchEvent;

  globalThis.window = globalThis.self = globalThis;

  if (typeof globalThis.addEventListener !== 'function') {
    const globalEventTarget = new EventTarget();
    globalThis.addEventListener = (...args) => {
      globalEventTarget.addEventListener(...args);
    };
    globalThis.removeEventListener = (...args) => {
      globalEventTarget.removeEventListener(...args);
    };
    globalThis.dispatchEvent = (...args) => {
      globalEventTarget.dispatchEvent(...args);
    };
  }
}

function getUnhandledErrors() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(unhandledErrors);
    });
  });
}

function afterEach() {
  globalThis.self = _self;
  globalThis.window = _window;
  globalThis.addEventListener = _addEventListener;
  globalThis.removeEventListener = _removeEventListener;
  globalThis.dispatchEvent = _dispatchEvent;
}

function initializeTestHarness() {
  const execute = new Function(testHarnessScript);
  execute();
}

async function executeTest(test) {
  beforeEach();
  try {
    initializeTestHarness();
    const testComplete = new Promise((resolve) => {
      add_completion_callback((tests, status) => {
        resolve({ tests, status });
      });
    });
    await import(path.join(wptDir, testPath, test));

    const unhandledErrors = await getUnhandledErrors();
    const result = await testComplete;

    return { ...result, unhandledErrors };
  } finally {
    afterEach();
  }
}

async function* runTests() {
  const tests = await fs.promises.readdir(path.join(wptDir, testPath));
  const validTests = tests.filter((test) => test.endsWith('.any.js'));
  for (let test of validTests) {
    yield { test, result: await executeTest(test) };
  }
}

function prettyPrintTestResult({ test, result }) {
  console.log(`\n${bold(test)}:`);
  if (result.unhandledErrors) {
    console.log(red('Unhandled errors:'));
    for (const error of result.unhandledErrors) {
      console.error(error);
    }
  }

  for (const test of result.tests) {
    if (test.status === 0) {
      console.log(green('PASS'), test.name);
    } else {
      console.log(red('FAIL'), test.name);
      console.log(test.message);
    }
  }
}

async function main() {
  await import(polyfillScriptPath);

  await ensureWPTRepo();

  let totalTests = 0;
  let totalFailed = 0;
  let hadUnhandledErrors = false;

  for await (const testResult of runTests()) {
    totalTests += testResult.result.tests.length;
    totalFailed += testResult.result.tests.filter((test) => test.status !== 0).length;
    if (testResult.result.unhandledErrors) {
      hadUnhandledErrors = true;
    }

    prettyPrintTestResult(testResult);
  }

  console.log();
  console.log(bold('Summary:'));
  console.log(bold(`Total tests: ${totalTests}`));
  console.log(bold(`Failed: ${totalFailed}`));
  console.log(bold(`Unhandled errors: ${hadUnhandledErrors ? 'yes' : 'no'}`));
  console.log();

  if (hadUnhandledErrors || totalFailed > 0) {
    process.exit(1);
  }
}

main();

function color(text, color) {
  return `\x1b[${color}m${text}\x1b[0m`;
}

function red(text) {
  return color(text, 31);
}

function bold(text) {
  return color(text, 1);
}

function green(text) {
  return color(text, 32);
}
