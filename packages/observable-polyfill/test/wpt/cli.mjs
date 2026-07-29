#!/usr/bin/env node

import { readConfig } from './lib/config.mjs';
import { importWpt } from './lib/importer.mjs';
import { doctor, runWpt, updateExpectations, verifyImport } from './lib/runner.mjs';

function readOption(args, optionName) {
  const index = args.indexOf(optionName);
  if (index === -1) {
    return undefined;
  }
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${optionName} requires a value`);
  }
  return value;
}

function printHelp() {
  process.stdout.write(`Observable WPT harness

Usage:
  node cli.mjs doctor
  node cli.mjs import --commit <40-character-sha>
  node cli.mjs verify-import
  node cli.mjs test [--baseline]
  node cli.mjs update-expectations

The test command runs WPT conformance by default. --baseline compares against
recorded known failures.
`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help') {
    printHelp();
    return;
  }

  if (command === 'doctor') {
    const result = await doctor();
    process.stdout.write(
      `Observable WPT doctor passed: ${result.inventory.length} URLs, ` +
        `Chrome ${result.browser.versions.chrome}, Python ${result.python.version}, ` +
        `implementation ${result.bundleManifest.implementationId}\n`
    );
    return;
  }

  if (command === 'import') {
    const commit = readOption(args, '--commit');
    if (!commit) {
      throw new Error('wpt:import requires --commit <40-character-sha>');
    }
    const config = await readConfig();
    const provenance = await importWpt({
      config,
      commit,
      existingCheckout: process.env.RXJS_WPT_IMPORT_CHECKOUT,
    });
    process.stdout.write(`Imported ${provenance.files.length} files from WPT ${provenance.commit}\n`);
    return;
  }

  if (command === 'verify-import') {
    const result = await verifyImport();
    process.stdout.write(`Pinned WPT import is intact (${result.inventory.length} generated test URLs)\n`);
    return;
  }

  if (command === 'test') {
    const baseline = args.includes('--baseline');
    const unknownOptions = args.filter((argument) => argument !== '--baseline');
    if (unknownOptions.length > 0) {
      throw new Error(`Unknown test option: ${unknownOptions.join(', ')}`);
    }

    const result = await runWpt({
      baseline,
      onProgress: (message) => process.stdout.write(`${message}\n`),
    });
    process.stdout.write(result.consoleReport);
    return;
  }

  if (command === 'update-expectations') {
    const result = await updateExpectations();
    process.stdout.write(
      `Recorded a stable Observable WPT baseline from ${result.runs.length} complete attested runs.\n`
    );
    return;
  }

  throw new Error(`Unknown Observable WPT command: ${command}`);
}

main().catch((error) => {
  process.stderr.write(
    typeof error.consoleReport === 'string'
      ? error.consoleReport
      : `${error.stack ?? error}\n`
  );
  process.exitCode = 1;
});
