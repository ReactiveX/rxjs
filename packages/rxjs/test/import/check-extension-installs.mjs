import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRoot = resolve(packageRoot, 'src');
const files = (await readdir(sourceRoot)).filter((file) => file.endsWith('.ts') && !file.endsWith('.spec.ts')).sort();
const failures = [];
let capabilityCount = 0;

for (const file of files) {
  const source = await readFile(resolve(sourceRoot, file), 'utf8');
  const symbols = [...source.matchAll(/export const (\w+): unique symbol = Symbol\('[^']+'\)/g)].map((match) => match[1]);
  for (const symbol of symbols) {
    capabilityCount += 1;
    if (!source.includes("from './util/install-observable-extension.js'")) {
      failures.push(`${file}: ${symbol} does not import the common extension installer`);
    }
    if (!source.includes(`symbol: ${symbol}`)) {
      failures.push(`${file}: ${symbol} is not passed to the common extension installer`);
    }
    if (new RegExp(`Observable(?:\\.prototype)?\\[${symbol}\\]\\s*=`).test(source)) {
      failures.push(`${file}: ${symbol} still uses direct public installation`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Extension installation audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
}

process.stdout.write(`Extension installation audit passed for ${capabilityCount} exact public Symbols.\n`);
