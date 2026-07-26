#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const supportedExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.mts', '.cjs', '.cts']);
const marbleSignals = [
  'TestScheduler',
  'expectObservable',
  'expectSubscriptions',
  'createColdObservable',
  'createHotObservable',
];
const helperNames = ['cold', 'hot', 'time', 'expectObservable', 'expectSubscriptions', 'animate', 'flush'];

export async function analyzePaths(inputPaths) {
  const files = await collectFiles(inputPaths);
  const cases = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    if (!marbleSignals.some((signal) => source.includes(signal))) {
      continue;
    }
    for (const testCase of extractTestCases(source, file)) {
      if (!marbleSignals.some((signal) => testCase.source.includes(signal))) {
        continue;
      }
      cases.push(testCase);
    }
  }

  const canonicalByFingerprint = new Map();
  for (const testCase of cases) {
    const canonical = canonicalByFingerprint.get(testCase.fingerprint);
    if (canonical) {
      testCase.duplicateOf = canonical;
    } else {
      canonicalByFingerprint.set(testCase.fingerprint, testCase.id);
    }
  }

  return {
    files: files.length,
    marbleFiles: new Set(cases.map((testCase) => testCase.file)).size,
    cases,
    duplicateCandidates: cases.filter((testCase) => testCase.duplicateOf).length,
  };
}

async function collectFiles(inputPaths) {
  const files = [];
  for (const inputPath of inputPaths) {
    const absolutePath = resolve(inputPath);
    const inputStat = await stat(absolutePath);
    if (inputStat.isDirectory()) {
      await collectDirectory(absolutePath, files);
    } else if (inputStat.isFile() && supportedExtensions.has(extname(absolutePath))) {
      files.push(absolutePath);
    }
  }
  files.sort();
  return files;
}

async function collectDirectory(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await collectDirectory(path, files);
    } else if (entry.isFile() && supportedExtensions.has(extname(path))) {
      files.push(path);
    }
  }
}

function extractTestCases(source, file) {
  const cases = [];
  const scanner = createScanner(source);

  while (!scanner.done) {
    scanner.skipTriviaAndLiterals();
    const identifier = scanner.readIdentifier();
    if (!identifier || !['it', 'test', 'specify'].includes(identifier.value)) {
      scanner.advance();
      continue;
    }

    scanner.skipTrivia();
    if (scanner.peek() === '.') {
      scanner.advance();
      scanner.skipTrivia();
      const modifier = scanner.readIdentifier();
      if (!modifier || !['only', 'skip', 'todo', 'fails', 'concurrent'].includes(modifier.value)) {
        continue;
      }
      scanner.skipTrivia();
    }

    if (scanner.peek() !== '(') {
      continue;
    }

    const start = identifier.start;
    const end = scanner.findMatchingDelimiter('(', ')');
    if (end === -1) {
      continue;
    }

    const caseSource = source.slice(start, end + 1);
    const line = countLines(source, start);
    const title = readFirstStringArgument(caseSource) ?? `${identifier.value} at line ${line}`;
    const normalized = normalizeCase(caseSource);
    const helpers = helperNames.filter((helper) => new RegExp(`\\b${helper}\\s*\\(`).test(caseSource));
    const reviewFlags = detectReviewFlags(caseSource);
    const fingerprint = createHash('sha256').update(normalized).digest('hex');
    cases.push({
      id: `${file}:${line}:${title}`,
      file,
      line,
      title,
      form: /\.run\s*\(/.test(caseSource) ? 'run' : 'manual-or-mixed',
      helpers,
      reviewFlags,
      fingerprint,
      duplicateOf: null,
      source: caseSource,
    });
    scanner.position = end + 1;
  }

  return cases;
}

function detectReviewFlags(source) {
  const flags = [];
  if (/\bflush\s*\(/.test(source)) {
    flags.push('await-flush');
  }
  if (/\b(frameTimeFactor|maxFrames)\b|\.frame\b/.test(source)) {
    flags.push('scheduler-internals');
  }
  if (/\b(createColdObservable|createHotObservable)\s*\(/.test(source) && !/\.run\s*\(/.test(source)) {
    flags.push('manual-test-scheduler');
  }
  if (/\b(asyncScheduler|asapScheduler|animationFrameScheduler|queueScheduler)\b/.test(source)) {
    flags.push('scheduler-argument');
  }
  if ((source.match(/\bexpectObservable\s*\(/g) ?? []).length > 1) {
    flags.push('multiple-observers');
  }
  if (/\bsubscribe\s*\(/.test(source)) {
    flags.push('direct-subscription');
  }
  return flags;
}

function normalizeCase(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n\r]*/g, '')
    .replace(/\b[A-Za-z_$][A-Za-z0-9_$]*\.run\s*\(/g, 'testScheduler.run(')
    .replace(/\s+/g, ' ')
    .trim();
}

function readFirstStringArgument(source) {
  const match = source.match(/^[^(]+\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1/);
  return match?.[2]?.replace(/\\(['"`\\])/g, '$1');
}

function countLines(source, position) {
  let line = 1;
  for (let index = 0; index < position; index++) {
    if (source.charCodeAt(index) === 10) {
      line++;
    }
  }
  return line;
}

function createScanner(source) {
  return {
    source,
    position: 0,
    get done() {
      return this.position >= this.source.length;
    },
    peek() {
      return this.source[this.position];
    },
    advance() {
      this.position++;
    },
    skipTrivia() {
      skipTrivia(this);
    },
    skipTriviaAndLiterals() {
      skipTriviaAndLiterals(this);
    },
    readIdentifier() {
      return readIdentifier(this);
    },
    findMatchingDelimiter(open, close) {
      return findMatchingDelimiter(this, open, close);
    },
  };
}

function skipTrivia(scanner) {
  while (!scanner.done) {
    const character = scanner.peek();
    const next = scanner.source[scanner.position + 1];
    if (/\s/.test(character)) {
      scanner.advance();
    } else if (character === '/' && next === '/') {
      scanner.position = scanner.source.indexOf('\n', scanner.position + 2);
      if (scanner.position === -1) {
        scanner.position = scanner.source.length;
      }
    } else if (character === '/' && next === '*') {
      const end = scanner.source.indexOf('*/', scanner.position + 2);
      scanner.position = end === -1 ? scanner.source.length : end + 2;
    } else {
      break;
    }
  }
}

function skipTriviaAndLiterals(scanner) {
  skipTrivia(scanner);
  const character = scanner.peek();
  if (character === '"' || character === "'" || character === '`') {
    scanner.position = skipQuoted(scanner.source, scanner.position, character);
  }
}

function readIdentifier(scanner) {
  const start = scanner.position;
  const first = scanner.peek();
  if (!first || !/[A-Za-z_$]/.test(first)) {
    return null;
  }
  scanner.advance();
  while (!scanner.done && /[A-Za-z0-9_$]/.test(scanner.peek())) {
    scanner.advance();
  }
  return { start, value: scanner.source.slice(start, scanner.position) };
}

function findMatchingDelimiter(scanner, open, close) {
  if (scanner.peek() !== open) {
    return -1;
  }
  let depth = 0;
  for (let index = scanner.position; index < scanner.source.length; index++) {
    const character = scanner.source[index];
    const next = scanner.source[index + 1];
    if (character === '"' || character === "'" || character === '`') {
      index = skipQuoted(scanner.source, index, character) - 1;
    } else if (character === '/' && next === '/') {
      const newline = scanner.source.indexOf('\n', index + 2);
      index = newline === -1 ? scanner.source.length : newline;
    } else if (character === '/' && next === '*') {
      const commentEnd = scanner.source.indexOf('*/', index + 2);
      index = commentEnd === -1 ? scanner.source.length : commentEnd + 1;
    } else if (character === open) {
      depth++;
    } else if (character === close) {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function skipQuoted(source, start, quote) {
  for (let index = start + 1; index < source.length; index++) {
    const character = source[index];
    if (character === '\\') {
      index++;
    } else if (character === quote) {
      return index + 1;
    }
  }
  return source.length;
}

async function main() {
  const inputPaths = process.argv.slice(2);
  if (inputPaths.length === 0) {
    throw new Error('Usage: analyze-marble-tests.mjs <file-or-directory> [...]');
  }
  const result = await analyzePaths(inputPaths);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
