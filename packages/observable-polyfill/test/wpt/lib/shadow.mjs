import fs from 'node:fs/promises';
import path from 'node:path';
import { buildHarnessBundles } from './bundle.mjs';
import { copyTree, listFiles, replaceDirectory } from './files.mjs';
import { cacheRoot, expectationsRoot, upstreamRoot } from './paths.mjs';

const metaPrelude =
  '// META: script=/resources/rxjs-wpt/wpt-bootstrap.js\n' +
  '// META: script=/resources/rxjs-wpt/attestation-test.js\n';

async function instrumentJavascript(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  if (source.includes('/resources/rxjs-wpt/wpt-bootstrap.js')) {
    throw new Error(`Generated bootstrap is already present in upstream source: ${filePath}`);
  }
  await fs.writeFile(filePath, `${metaPrelude}${source}`);
}

async function instrumentHtml(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  const needle = '<script src="/resources/testharness.js"></script>';
  const occurrences = source.split(needle).length - 1;
  if (occurrences !== 1) {
    throw new Error(`${filePath}: expected one testharness.js script, found ${occurrences}`);
  }
  const injection =
    `${needle}\n` +
    '  <script src="/resources/rxjs-wpt/wpt-bootstrap.js"></script>\n' +
    '  <script src="/resources/rxjs-wpt/attestation-test.js"></script>';
  await fs.writeFile(filePath, source.replace(needle, injection));
}

export async function prepareShadowTree({ config, inventory }) {
  await fs.mkdir(cacheRoot, { recursive: true });
  const temporaryRoot = await fs.mkdtemp(path.join(cacheRoot, '.shadow-'));
  const shadowRoot = path.join(cacheRoot, 'shadow');

  try {
    await copyTree(upstreamRoot, temporaryRoot);
    await copyTree(expectationsRoot, temporaryRoot);

    const observableRoot = path.join(temporaryRoot, 'dom/observable/tentative');
    for (const relativePath of await listFiles(observableRoot)) {
      const filePath = path.join(observableRoot, relativePath);
      if (filePath.endsWith('.any.js') || filePath.endsWith('.window.js')) {
        await instrumentJavascript(filePath);
      } else if (filePath.endsWith('.html')) {
        await instrumentHtml(filePath);
      }
    }

    const bundleRoot = path.join(temporaryRoot, 'resources/rxjs-wpt');
    const bundleManifest = await buildHarnessBundles({ config, outputRoot: bundleRoot });
    await fs.writeFile(
      path.join(temporaryRoot, 'rxjs-wpt-inventory.json'),
      `${JSON.stringify({ wptCommit: config.wpt.commit, implementationId: bundleManifest.implementationId, urls: inventory }, null, 2)}\n`
    );

    await replaceDirectory(temporaryRoot, shadowRoot);
    return { shadowRoot, bundleManifest };
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}
