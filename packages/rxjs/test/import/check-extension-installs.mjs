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
    const staticAssignment = new RegExp(`Observable\\[${symbol}\\]\\s*=`).test(source);
    const instanceAssignment = new RegExp(`Observable\\.prototype\\[${symbol}\\]\\s*=`).test(source);
    if (!staticAssignment && !instanceAssignment) {
      failures.push(`${file}: ${symbol} is not assigned directly under its exported exact Symbol`);
    }
    if (new RegExp(`interface\\s+ObservableCtor\\s*{[\\s\\S]*?\\[${symbol}\\]`).test(source) && !staticAssignment) {
      failures.push(`${file}: ${symbol} declares a static capability without a matching Observable assignment`);
    }
    if (new RegExp(`interface\\s+Observable(?:<[^>]+>)?\\s*{[\\s\\S]*?\\[${symbol}\\]`).test(source) && !instanceAssignment) {
      failures.push(`${file}: ${symbol} declares an instance capability without a matching Observable.prototype assignment`);
    }
  }

  if (source.includes('installObservableExtension') || source.includes('install-observable-extension.js')) {
    failures.push(`${file}: still references the superseded common extension installer`);
  }
  for (const match of source.matchAll(/Observable(?:\.prototype)?(?:\.(\w+)|\[['"]([^'"]+)['"]\])\s*=/g)) {
    failures.push(`${file}: installs the RxJS string-named property ${match[1] ?? match[2]}`);
  }
}

if (failures.length > 0) {
  throw new Error(`Extension installation audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
}

process.stdout.write(`Direct extension installation audit passed for ${capabilityCount} exact public Symbols.\n`);
