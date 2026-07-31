#!/usr/bin/env node

import { migrateMochaChaiToVitest, mochaChaiToVitestAdapter } from './mocha-chai-vitest.js';
import { migrateTestFiles } from './node.js';

interface CliOptions {
  readonly files: string[];
  sourceRoot?: string;
  outputRoot?: string;
  repository?: string;
  sha?: string;
  mode: 'cold' | 'platform';
  framework: 'preserve' | 'mocha-chai-vitest';
  write: boolean;
  help: boolean;
}

export async function runCli(argv: readonly string[]): Promise<number> {
  const options = parseArguments(argv);
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  if (options.files.length === 0 || !options.sourceRoot || !options.repository || !options.sha) {
    process.stderr.write(`${usage()}\n`);
    return 2;
  }
  if (options.write && !options.outputRoot) {
    process.stderr.write('rxjs-migrate: --out-dir is required with --write.\n');
    return 2;
  }

  const frameworkAdapter = options.framework === 'mocha-chai-vitest' ? mochaChaiToVitestAdapter : undefined;
  const migrated = await migrateTestFiles({
    files: options.files,
    sourceRoot: options.sourceRoot,
    outputRoot: options.outputRoot,
    sourceRepository: options.repository,
    sourceSha: options.sha,
    mode: options.mode,
    frameworkAdapter,
    write: options.write,
  });

  if (!options.write && migrated.length === 1) {
    const first = migrated[0];
    if (first) process.stdout.write(first.result.code);
  } else {
    process.stdout.write(
      `${JSON.stringify(
        migrated.map(({ sourcePath, outputPath, result }) => ({
          sourcePath,
          outputPath,
          changed: result.changed,
          diagnostics: result.diagnostics,
        })),
        null,
        2
      )}\n`
    );
  }
  return migrated.some(({ result }) => result.diagnostics.some(({ code }) => code === 'missing-capability')) ? 1 : 0;
}

function parseArguments(argv: readonly string[]): CliOptions {
  const options: CliOptions = { files: [], mode: 'cold', framework: 'preserve', write: false, help: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (!argument) continue;
    switch (argument) {
      case '--source-root':
        options.sourceRoot = argv[++index];
        break;
      case '--out-dir':
        options.outputRoot = argv[++index];
        break;
      case '--source-repo':
        options.repository = argv[++index];
        break;
      case '--source-sha':
        options.sha = argv[++index];
        break;
      case '--mode': {
        const mode = argv[++index];
        if (mode !== 'cold' && mode !== 'platform') throw new Error(`Unknown mode: ${mode}`);
        options.mode = mode;
        break;
      }
      case '--framework': {
        const framework = argv[++index];
        if (framework !== 'preserve' && framework !== 'mocha-chai-vitest') throw new Error(`Unknown framework: ${framework}`);
        options.framework = framework;
        break;
      }
      case '--write':
        options.write = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        if (argument.startsWith('-')) throw new Error(`Unknown option: ${argument}`);
        options.files.push(argument);
    }
  }
  return options;
}

function usage(): string {
  return [
    'Usage: rxjs-migrate [options] <test files...>',
    '',
    'Required: --source-root <dir> --source-repo <url> --source-sha <sha>',
    'Options:  --mode cold|platform',
    '          --framework preserve|mocha-chai-vitest',
    '          --write --out-dir <dir>',
    '',
    'Without --write the command is a dry run and prints a single migrated file.',
  ].join('\n');
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/cli.js')) {
  runCli(process.argv.slice(2)).then(
    (status) => {
      process.exitCode = status;
    },
    (error: unknown) => {
      process.stderr.write(`rxjs-migrate: ${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    }
  );
}

void migrateMochaChaiToVitest;
