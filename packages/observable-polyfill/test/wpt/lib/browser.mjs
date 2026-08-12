import crypto from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { cacheRoot } from './paths.mjs';
import { pathExists } from './files.mjs';
import { hashFile } from './hash.mjs';
import { runProcess } from './process.mjs';

export const browserIsolationArgs = Object.freeze([
  '--disable-background-networking',
  '--disable-client-side-phishing-detection',
  '--disable-component-extensions-with-background-pages',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-domain-reliability',
  '--disable-sync',
  '--metrics-recording-only',
  '--gcm-checkin-url=http://127.0.0.1:9',
  '--gcm-mcs-endpoint=127.0.0.1:9',
  '--gcm-registration-url=http://127.0.0.1:9',
  '--no-first-run',
  '--no-default-browser-check',
  '--no-pings',
  '--no-proxy-server',
  '--safebrowsing-disable-auto-update',
]);

function currentPlatformKey() {
  if (process.platform === 'linux' && process.arch === 'x64') {
    return 'linux-x64';
  }
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return 'darwin-arm64';
  }
  if (process.platform === 'darwin' && process.arch === 'x64') {
    return 'darwin-x64';
  }
  throw new Error(`The Observable WPT browser lock does not support ${process.platform}-${process.arch}`);
}

function download(url, destination) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        download(new URL(response.headers.location, url).toString(), destination).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Could not download ${url}: HTTP ${response.statusCode}`));
        return;
      }

      const output = fs.createWriteStream(destination, { flags: 'wx' });
      response.pipe(output);
      output.on('finish', () => output.close(resolve));
      output.on('error', reject);
    });
    request.on('error', reject);
  });
}

async function ensureComponent({ componentName, component, componentRoot, offline }) {
  const executable = path.join(componentRoot, component.executable);
  const verificationPath = path.join(componentRoot, '.verified.json');
  if ((await pathExists(executable)) && (await pathExists(verificationPath))) {
    const verification = JSON.parse(await fsPromises.readFile(verificationPath, 'utf8'));
    if (
      verification.url === component.url &&
      verification.checksum === component.checksum &&
      verification.size === component.size
    ) {
      return executable;
    }
  }

  if (offline) {
    throw new Error(`Pinned ${componentName} is not cached and RXJS_WPT_OFFLINE=1`);
  }

  await fsPromises.rm(componentRoot, { recursive: true, force: true });
  await fsPromises.mkdir(componentRoot, { recursive: true });
  const archivePath = path.join(componentRoot, `${componentName}.zip`);
  await download(component.url, archivePath);

  const stat = await fsPromises.stat(archivePath);
  if (stat.size !== component.size) {
    throw new Error(`${componentName} archive size mismatch: expected ${component.size}, got ${stat.size}`);
  }
  const checksum = await hashFile(archivePath, 'md5');
  if (!crypto.timingSafeEqual(Buffer.from(checksum), Buffer.from(component.checksum))) {
    throw new Error(`${componentName} archive checksum mismatch`);
  }

  await runProcess('unzip', ['-q', archivePath, '-d', componentRoot]);
  await fsPromises.chmod(executable, 0o755);
  await fsPromises.writeFile(
    verificationPath,
    `${JSON.stringify(
      {
        url: component.url,
        checksumAlgorithm: 'md5',
        checksum: component.checksum,
        size: component.size,
      },
      null,
      2
    )}\n`
  );
  await fsPromises.rm(archivePath);
  return executable;
}

export async function resolveBrowserBinaries({ config, browserLock, allowDownload }) {
  const chromeFromEnvironment = process.env.RXJS_WPT_CHROME_BINARY;
  const driverFromEnvironment = process.env.RXJS_WPT_CHROMEDRIVER;
  if ((chromeFromEnvironment === undefined) !== (driverFromEnvironment === undefined)) {
    throw new Error('Set RXJS_WPT_CHROME_BINARY and RXJS_WPT_CHROMEDRIVER together');
  }
  if (chromeFromEnvironment && driverFromEnvironment) {
    return {
      chrome: path.resolve(chromeFromEnvironment),
      chromedriver: path.resolve(driverFromEnvironment),
      source: 'environment',
    };
  }

  if (browserLock.version !== config.browser.version) {
    throw new Error('browser-lock.json and config.json pin different Chrome versions');
  }
  const platformKey = currentPlatformKey();
  const platformLock = browserLock.platforms[platformKey];
  if (!platformLock) {
    throw new Error(`No browser lock entry for ${platformKey}`);
  }

  const browserRoot = path.join(cacheRoot, 'browser', browserLock.version, platformKey);
  const offline = process.env.RXJS_WPT_OFFLINE === '1' || !allowDownload;
  const chrome = await ensureComponent({
    componentName: 'chrome',
    component: platformLock.chrome,
    componentRoot: path.join(browserRoot, 'chrome'),
    offline,
  });
  const chromedriver = await ensureComponent({
    componentName: 'chromedriver',
    component: platformLock.chromedriver,
    componentRoot: path.join(browserRoot, 'chromedriver'),
    offline,
  });
  return { chrome, chromedriver, source: 'cache' };
}

function parseVersion(output, label) {
  const match = /\b(?<version>\d+\.\d+\.\d+\.\d+)\b/.exec(output);
  if (!match?.groups?.version) {
    throw new Error(`Could not parse ${label} version from: ${output.trim()}`);
  }
  return match.groups.version;
}

export async function readBrowserVersions(binaries) {
  const [chromeResult, driverResult] = await Promise.all([
    runProcess(binaries.chrome, ['--version'], { capture: true }),
    runProcess(binaries.chromedriver, ['--version'], { capture: true }),
  ]);
  return {
    chrome: parseVersion(chromeResult.stdout || chromeResult.stderr, 'Chrome'),
    chromedriver: parseVersion(driverResult.stdout || driverResult.stderr, 'ChromeDriver'),
  };
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a ChromeDriver port'));
        return;
      }
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(address.port);
        }
      });
    });
  });
}

function webdriverRequest({ port, method, pathname, body }) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const request = http.request(
      {
        hostname: '127.0.0.1',
        port,
        method,
        path: pathname,
        headers: payload
          ? {
              'content-type': 'application/json; charset=utf-8',
              'content-length': Buffer.byteLength(payload),
            }
          : undefined,
      },
      (response) => {
        let responseBody = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          let parsed;
          try {
            parsed = responseBody ? JSON.parse(responseBody) : {};
          } catch {
            reject(new Error(`ChromeDriver returned invalid JSON for ${method} ${pathname}`));
            return;
          }
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`ChromeDriver ${method} ${pathname} failed: ${responseBody}`));
            return;
          }
          resolve(parsed);
        });
      }
    );
    request.on('error', reject);
    if (payload) {
      request.write(payload);
    }
    request.end();
  });
}

async function waitForChromeDriver(port) {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      await webdriverRequest({ port, method: 'GET', pathname: '/status' });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error('ChromeDriver did not become ready');
}

const nativeProbeScript = `
const done = arguments[arguments.length - 1];
const inspect = (target) => {
  const observableDescriptor = Object.getOwnPropertyDescriptor(target, "Observable");
  const whenDescriptor = Object.getOwnPropertyDescriptor(target.EventTarget.prototype, "when");
  return {
    observable: typeof target.Observable === "function",
    subscribe: typeof target.Observable?.prototype?.subscribe === "function",
    when: typeof target.EventTarget?.prototype?.when === "function",
    observableReplaceable:
      observableDescriptor?.configurable === true ||
      ("writable" in (observableDescriptor || {}) && observableDescriptor.writable === true),
    whenReplaceable:
      whenDescriptor?.configurable === true ||
      ("writable" in (whenDescriptor || {}) && whenDescriptor.writable === true),
  };
};

const results = { window: inspect(window) };
let remaining = 2;
let finished = false;
const finish = () => {
  remaining--;
  if (remaining === 0 && !finished) {
    finished = true;
    done(results);
  }
};
const fail = (message) => {
  if (!finished) {
    finished = true;
    done({ error: message, ...results });
  }
};

const iframe = document.createElement("iframe");
iframe.onload = () => {
  try {
    results.iframe = inspect(iframe.contentWindow);
    iframe.remove();
    finish();
  } catch (error) {
    fail(String(error));
  }
};
iframe.onerror = () => fail("iframe failed to load");
document.body.append(iframe);

const workerSource = \`
  const observableDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Observable");
  const whenDescriptor = Object.getOwnPropertyDescriptor(EventTarget.prototype, "when");
  postMessage({
    observable: typeof Observable === "function",
    subscribe: typeof Observable?.prototype?.subscribe === "function",
    when: typeof EventTarget?.prototype?.when === "function",
    observableReplaceable:
      observableDescriptor?.configurable === true ||
      ("writable" in (observableDescriptor || {}) && observableDescriptor.writable === true),
    whenReplaceable:
      whenDescriptor?.configurable === true ||
      ("writable" in (whenDescriptor || {}) && whenDescriptor.writable === true),
  });
\`;
const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
const worker = new Worker(workerUrl);
worker.onmessage = (event) => {
  results.worker = event.data;
  worker.terminate();
  URL.revokeObjectURL(workerUrl);
  finish();
};
worker.onerror = (event) => fail(event.message || "worker failed");
setTimeout(() => fail("native exposure probe timed out"), 5000);
`;

export async function runBrowserAsyncScript({ binaries, script, args = [], label = 'Browser script' }) {
  const port = await getFreePort();
  const driver = spawn(binaries.chromedriver, [`--port=${port}`, '--allowed-ips=127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let driverLog = '';
  driver.stdout.setEncoding('utf8');
  driver.stderr.setEncoding('utf8');
  driver.stdout.on('data', (chunk) => {
    driverLog += chunk;
  });
  driver.stderr.on('data', (chunk) => {
    driverLog += chunk;
  });

  let sessionId;
  try {
    await waitForChromeDriver(port);
    const response = await webdriverRequest({
      port,
      method: 'POST',
      pathname: '/session',
      body: {
        capabilities: {
          alwaysMatch: {
            browserName: 'chrome',
            'goog:chromeOptions': {
              binary: binaries.chrome,
              args: ['--headless=new', '--disable-dev-shm-usage', ...(process.platform === 'linux' ? ['--no-sandbox'] : []), ...browserIsolationArgs],
            },
          },
        },
      },
    });
    sessionId = response.value?.sessionId ?? response.sessionId;
    if (typeof sessionId !== 'string') {
      throw new Error(`ChromeDriver did not return a session id: ${JSON.stringify(response)}`);
    }

    const result = await webdriverRequest({
      port,
      method: 'POST',
      pathname: `/session/${sessionId}/execute/async`,
      body: { script, args },
    });
    if (result.value?.error) {
      throw new Error(`${label} failed: ${result.value.error}`);
    }
    return result.value;
  } catch (error) {
    throw new Error(`${error.message}${driverLog.trim() ? `\n${driverLog.trim()}` : ''}`);
  } finally {
    if (sessionId) {
      await webdriverRequest({
        port,
        method: 'DELETE',
        pathname: `/session/${sessionId}`,
      }).catch(() => undefined);
    }
    driver.kill('SIGTERM');
  }
}

export async function probeNativeExposure(binaries) {
  return runBrowserAsyncScript({
    binaries,
    script: nativeProbeScript,
    label: 'Native exposure probe',
  });
}

export async function verifyBrowser({ config, binaries, allowBrowserDrift }) {
  for (const [name, filePath] of Object.entries(binaries)) {
    if (name === 'source') {
      continue;
    }
    if (!(await pathExists(filePath))) {
      throw new Error(`${name} binary does not exist: ${filePath}`);
    }
  }

  const versions = await readBrowserVersions(binaries);
  if (!allowBrowserDrift && versions.chrome !== config.browser.version) {
    throw new Error(`Expected Chrome ${config.browser.version}, got ${versions.chrome}`);
  }
  if (!allowBrowserDrift && versions.chromedriver !== config.browser.version) {
    throw new Error(`Expected ChromeDriver ${config.browser.version}, got ${versions.chromedriver}`);
  }
  if (versions.chrome.split('.')[0] !== versions.chromedriver.split('.')[0]) {
    throw new Error(`Chrome ${versions.chrome} and ChromeDriver ${versions.chromedriver} have different milestones`);
  }

  const nativeExposure = await probeNativeExposure(binaries);
  for (const realm of ['window', 'worker', 'iframe']) {
    const result = nativeExposure[realm];
    if (
      !result ||
      !result.observable ||
      !result.subscribe ||
      !result.when ||
      !result.observableReplaceable ||
      !result.whenReplaceable
    ) {
      throw new Error(`Pinned Chrome native exposure check failed in ${realm}: ${JSON.stringify(result)}`);
    }
  }
  return { versions, nativeExposure };
}
