#!/usr/bin/env node

import { stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { manageSkillInstallation, skillHarnesses, type SkillHarness, type SkillInstallAction } from './skill-install.js';

export const skillCliExitCodes = { success: 0, refused: 1, invalidArguments: 2, operationalFailure: 3 } as const;
export type SkillCliExitCode = (typeof skillCliExitCodes)[keyof typeof skillCliExitCodes];

export interface SkillCliIo {
  readonly stdout: Pick<NodeJS.WriteStream, 'write'>;
  readonly stderr: Pick<NodeJS.WriteStream, 'write'>;
}

interface ParsedSkillCliOptions {
  readonly action: SkillInstallAction;
  readonly harness: SkillHarness;
  readonly projectRoot: string;
  readonly force: boolean;
}

export async function runSkillCli(
  argv: readonly string[],
  io: SkillCliIo = process,
  canonicalSkillRoot?: string
): Promise<SkillCliExitCode> {
  let options: ParsedSkillCliOptions;
  try {
    options = parseSkillArguments(argv);
  } catch (error: unknown) {
    writeJson(io.stderr, { schemaVersion: 1, status: 'error', error: { code: 'invalid-arguments', message: messageFor(error) } });
    return skillCliExitCodes.invalidArguments;
  }

  try {
    const result = await manageSkillInstallation(options.action, {
      projectRoot: options.projectRoot,
      canonicalSkillRoot: canonicalSkillRoot ?? (await resolveCanonicalSkillRoot()),
      harness: options.harness,
      force: options.force,
    });
    writeJson(io.stdout, { schemaVersion: 1, status: 'completed', result });
    return skillCliExitCodes.success;
  } catch (error: unknown) {
    const message = messageFor(error);
    const refused = /refusing/i.test(message);
    writeJson(io.stderr, {
      schemaVersion: 1,
      status: 'error',
      error: { code: refused ? 'refused' : 'operational-failure', message },
    });
    return refused ? skillCliExitCodes.refused : skillCliExitCodes.operationalFailure;
  }
}

export async function resolveCanonicalSkillRoot(modulePath = process.argv[1]): Promise<string> {
  if (!modulePath) throw new Error('Cannot locate the @rxjs/migrate package entry point.');
  const moduleDirectory = dirname(resolve(modulePath));
  for (const localPath of ['../skill', '../../skill']) {
    const candidate = resolve(moduleDirectory, localPath);
    try {
      if ((await stat(join(candidate, 'SKILL.md'))).isFile()) return candidate;
    } catch {
      // Try the source-tree or built-package alternative.
    }
  }
  throw new Error('Cannot locate the canonical Skill shipped by @rxjs/migrate.');
}

function parseSkillArguments(argv: readonly string[]): ParsedSkillCliOptions {
  const action = argv[0];
  if (action !== 'check' && action !== 'install' && action !== 'update' && action !== 'remove') {
    throw new Error(
      'Usage: rxjs-migrate-skill <check|install|update|remove> --harness <codex|claude|cursor> [--project-root <dir>] [--force]'
    );
  }
  let harness: SkillHarness | undefined;
  let projectRoot = process.cwd();
  let force = false;
  for (let index = 1; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--harness') {
      const value = argv[++index];
      if (!value || !skillHarnesses.includes(value as SkillHarness)) throw new Error('--harness requires codex, claude, or cursor');
      harness = value as SkillHarness;
    } else if (argument === '--project-root') {
      const value = argv[++index];
      if (!value) throw new Error('--project-root requires a directory');
      projectRoot = value;
    } else if (argument === '--force') {
      force = true;
    } else {
      throw new Error(`Unknown option: ${String(argument)}`);
    }
  }
  if (!harness) throw new Error('--harness is required');
  return { action, harness, projectRoot, force };
}

function writeJson(stream: Pick<NodeJS.WriteStream, 'write'>, value: unknown): void {
  stream.write(`${JSON.stringify(value, null, 2)}\n`);
}

function messageFor(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/skill-cli.js')) {
  runSkillCli(process.argv.slice(2)).then((status) => {
    process.exitCode = status;
  });
}
