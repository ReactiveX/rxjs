#!/usr/bin/env node

import { applyMigrationPlan, planMigrationFiles } from './node.js';
import { mochaChaiToVitestAdapter } from './mocha-chai-vitest.js';
import type { MigrateFilesOptions, MigratedFile } from './node.js';
import type { MigrationMode } from './types.js';
import { defaultCapabilityRegistry } from './capabilities.js';
import { migrationEngineVersion } from './version.js';

export const migrationCliReportSchemaVersion = 1 as const;

export const migrationCliExitCodes = {
  success: 0,
  refused: 1,
  invalidArguments: 2,
  operationalFailure: 3,
} as const;

export type MigrationCliExitCode = (typeof migrationCliExitCodes)[keyof typeof migrationCliExitCodes];

export interface MigrationCliReport {
  readonly schemaVersion: typeof migrationCliReportSchemaVersion;
  readonly engineVersion: string;
  readonly capabilityRegistryVersion: string;
  readonly operation: 'dry-run' | 'write';
  readonly status: 'completed' | 'refused';
  readonly mode: MigrationMode | null;
  readonly framework: 'preserve' | 'mocha-chai-vitest';
  readonly files: readonly MigratedFile[];
}

export interface MigrationCliErrorReport {
  readonly schemaVersion: typeof migrationCliReportSchemaVersion;
  readonly status: 'error';
  readonly error: {
    readonly code: 'invalid-arguments' | 'operational-failure';
    readonly message: string;
  };
}

interface CliOptions {
  readonly files: string[];
  sourceRoot?: string;
  outputRoot?: string;
  repository?: string;
  sha?: string;
  mode?: MigrationMode;
  framework: 'preserve' | 'mocha-chai-vitest';
  write: boolean;
  help: boolean;
}

type RunnableCliOptions = CliOptions & Required<Pick<CliOptions, 'sourceRoot' | 'repository' | 'sha'>>;

export interface MigrationCliIo {
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
}

/**
 * Creates the same structured result for programmatic and command-line users.
 * A write is attempted only after every result in the dry-run plan succeeds.
 */
export async function createMigrationCliReport(
  options: MigrateFilesOptions,
  framework: MigrationCliReport['framework'] = options.frameworkAdapter ? 'mocha-chai-vitest' : 'preserve'
): Promise<MigrationCliReport> {
  const plan = await planMigrationFiles({ ...options, write: false });
  const refused = plan.files.some(({ result }) => result.status === 'refused');
  if (options.write && !refused) await applyMigrationPlan(plan, { overwrite: options.overwrite });
  return {
    schemaVersion: migrationCliReportSchemaVersion,
    engineVersion: migrationEngineVersion,
    capabilityRegistryVersion: (options.capabilityRegistry ?? defaultCapabilityRegistry).registryVersion,
    operation: options.write ? 'write' : 'dry-run',
    status: refused ? 'refused' : 'completed',
    mode: options.mode ?? null,
    framework,
    files: plan.files,
  };
}

export async function runCli(argv: readonly string[], io: MigrationCliIo = process): Promise<MigrationCliExitCode> {
  let options: CliOptions;
  try {
    options = parseArguments(argv);
    if (options.help) {
      io.stdout.write(`${usage()}\n`);
      return migrationCliExitCodes.success;
    }
    validateArguments(options);
  } catch (error: unknown) {
    writeJson(io.stderr, errorReport('invalid-arguments', messageFor(error)));
    return migrationCliExitCodes.invalidArguments;
  }

  const frameworkAdapter = options.framework === 'mocha-chai-vitest' ? mochaChaiToVitestAdapter : undefined;
  try {
    const report = await createMigrationCliReport(
      {
        files: options.files,
        sourceRoot: options.sourceRoot,
        outputRoot: options.outputRoot,
        sourceRepository: options.repository,
        sourceSha: options.sha,
        mode: options.mode,
        frameworkAdapter,
        write: options.write,
      },
      options.framework
    );
    writeJson(io.stdout, report);
    return report.status === 'refused' ? migrationCliExitCodes.refused : migrationCliExitCodes.success;
  } catch (error: unknown) {
    writeJson(io.stderr, errorReport('operational-failure', messageFor(error)));
    return migrationCliExitCodes.operationalFailure;
  }
}

function parseArguments(argv: readonly string[]): CliOptions {
  const options: CliOptions = { files: [], framework: 'preserve', write: false, help: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (!argument) continue;
    switch (argument) {
      case '--source-root':
        options.sourceRoot = requiredValue(argv, ++index, argument);
        break;
      case '--out-dir':
        options.outputRoot = requiredValue(argv, ++index, argument);
        break;
      case '--source-repo':
        options.repository = requiredValue(argv, ++index, argument);
        break;
      case '--source-sha':
        options.sha = requiredValue(argv, ++index, argument);
        break;
      case '--mode': {
        const mode = requiredValue(argv, ++index, argument);
        if (mode !== 'cold' && mode !== 'platform') throw new Error(`Unknown mode: ${mode}`);
        options.mode = mode;
        break;
      }
      case '--framework': {
        const framework = requiredValue(argv, ++index, argument);
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

function validateArguments(options: CliOptions): asserts options is RunnableCliOptions {
  const missing = [
    options.files.length === 0 ? 'at least one source file' : undefined,
    options.sourceRoot ? undefined : '--source-root',
    options.repository ? undefined : '--source-repo',
    options.sha ? undefined : '--source-sha',
  ].filter((value): value is string => value !== undefined);
  if (missing.length > 0) throw new Error(`Missing required argument${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`);
  if (options.write && !options.outputRoot) throw new Error('--out-dir is required with --write');
}

function requiredValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index];
  if (!value || value.startsWith('-')) throw new Error(`${option} requires a value`);
  return value;
}

function errorReport(code: MigrationCliErrorReport['error']['code'], message: string): MigrationCliErrorReport {
  return { schemaVersion: migrationCliReportSchemaVersion, status: 'error', error: { code, message } };
}

function writeJson(stream: Pick<NodeJS.WriteStream, 'write'>, value: MigrationCliReport | MigrationCliErrorReport): void {
  stream.write(`${JSON.stringify(value, null, 2)}\n`);
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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
    'Without --write the command is a dry run. Results and errors are JSON.',
  ].join('\n');
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/cli.js')) {
  runCli(process.argv.slice(2)).then((status) => {
    process.exitCode = status;
  });
}
