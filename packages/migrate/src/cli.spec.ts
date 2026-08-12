import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMigrationCliReport, migrationCliExitCodes, migrationCliReportSchemaVersion, runCli, type MigrationCliIo } from './cli.js';
import { planMigrationFiles } from './node.js';

describe('migration CLI', () => {
  let root: string;
  let sourceRoot: string;
  let outputRoot: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'rxjs-migrate-cli-'));
    sourceRoot = join(root, 'source');
    outputRoot = join(root, 'output');
    await mkdir(sourceRoot);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('returns the complete API result as versioned JSON without writing by default', async () => {
    await writeFile(join(sourceRoot, 'example.ts'), 'export const value = 1;\n');
    const capture = capturedIo();
    const argv = baseArguments('example.ts');

    const exitCode = await runCli(argv, capture.io);
    const report = JSON.parse(capture.stdout()) as Record<string, unknown>;
    const apiPlan = await planMigrationFiles(apiOptions('example.ts'));

    expect(exitCode).toBe(migrationCliExitCodes.success);
    expect(report).toEqual({
      schemaVersion: migrationCliReportSchemaVersion,
      engineVersion: expect.any(String),
      capabilityRegistryVersion: expect.any(String),
      operation: 'dry-run',
      status: 'completed',
      mode: null,
      framework: 'preserve',
      files: apiPlan.files,
    });
    expect(capture.stderr()).toBe('');
    await expect(access(join(sourceRoot, 'example.unselected.spec.ts'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('writes only with the explicit flag and reports the exact bytes written', async () => {
    await writeFile(join(sourceRoot, 'example.ts'), 'export const value = 1;\n');
    const capture = capturedIo();

    const exitCode = await runCli([...baseArguments('example.ts'), '--write', '--out-dir', outputRoot], capture.io);
    const report = JSON.parse(capture.stdout()) as {
      operation: string;
      files: Array<{ outputPath: string; result: { code: string } }>;
    };
    const file = report.files[0];
    if (!file) throw new Error('Expected one reported file.');

    expect(exitCode).toBe(migrationCliExitCodes.success);
    expect(report.operation).toBe('write');
    expect(await readFile(file.outputPath, 'utf8')).toBe(file.result.code);
  });

  it('does not silently select lifecycle semantics and does not write a refused plan', async () => {
    await writeFile(
      join(sourceRoot, 'scheduler.ts'),
      "import { TestScheduler } from 'rxjs/testing';\nconst scheduler = new TestScheduler(() => undefined);\n"
    );
    const capture = capturedIo();

    const exitCode = await runCli([...baseArguments('scheduler.ts'), '--write', '--out-dir', outputRoot], capture.io);
    const report = JSON.parse(capture.stdout()) as {
      status: string;
      mode: string | null;
      files: Array<{ outputPath: string; result: { status: string; diagnostics: Array<{ code: string }> } }>;
    };
    const file = report.files[0];
    if (!file) throw new Error('Expected one reported file.');

    expect(exitCode).toBe(migrationCliExitCodes.refused);
    expect(report.status).toBe('refused');
    expect(report.mode).toBeNull();
    expect(file.result.status).toBe('refused');
    expect(file.result.diagnostics[0]?.code).toBe('lifecycle-review');
    await expect(access(file.outputPath)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('gives programmatic callers the same dry-run/write report contract', async () => {
    await writeFile(join(sourceRoot, 'example.ts'), 'export const value = 1;\n');

    const dryRun = await createMigrationCliReport(apiOptions('example.ts'));
    const write = await createMigrationCliReport({ ...apiOptions('example.ts'), outputRoot, write: true });
    const writtenFile = write.files[0];
    if (!writtenFile) throw new Error('Expected one written file.');

    expect(write).toEqual({ ...dryRun, operation: 'write', files: write.files });
    expect(write.files[0]?.result).toEqual(dryRun.files[0]?.result);
    expect(await readFile(writtenFile.outputPath, 'utf8')).toBe(writtenFile.result.code);
  });

  it('returns structured invalid-argument and operational errors with distinct exit codes', async () => {
    const invalidCapture = capturedIo();
    const invalidExit = await runCli(['--source-root'], invalidCapture.io);
    expect(invalidExit).toBe(migrationCliExitCodes.invalidArguments);
    expect(JSON.parse(invalidCapture.stderr())).toEqual({
      schemaVersion: migrationCliReportSchemaVersion,
      status: 'error',
      error: { code: 'invalid-arguments', message: '--source-root requires a value' },
    });

    const operationalCapture = capturedIo();
    const operationalExit = await runCli(baseArguments('missing.ts'), operationalCapture.io);
    const operational = JSON.parse(operationalCapture.stderr()) as { error: { code: string; message: string } };
    expect(operationalExit).toBe(migrationCliExitCodes.operationalFailure);
    expect(operational.error.code).toBe('operational-failure');
    expect(operational.error.message).toContain('missing.ts');
  });

  it('detects a CLI/API report mismatch in the negative control', async () => {
    await writeFile(join(sourceRoot, 'example.ts'), 'export const value = 1;\n');
    const report = await createMigrationCliReport(apiOptions('example.ts'));
    const mismatched = { ...report, capabilityRegistryVersion: 'drifted' };

    expect(() => assertEquivalentReports(report, mismatched)).toThrow('CLI/API report mismatch');
  });

  function baseArguments(file: string): string[] {
    return ['--source-root', sourceRoot, '--source-repo', 'https://example.test/repository.git', '--source-sha', 'abc123', file];
  }

  function apiOptions(file: string) {
    return {
      files: [file],
      sourceRoot,
      sourceRepository: 'https://example.test/repository.git',
      sourceSha: 'abc123',
    };
  }
});

function assertEquivalentReports(left: unknown, right: unknown): void {
  if (JSON.stringify(left) !== JSON.stringify(right)) throw new Error('CLI/API report mismatch');
}

function capturedIo(): { io: MigrationCliIo; stdout(): string; stderr(): string } {
  let stdout = '';
  let stderr = '';
  return {
    io: {
      stdout: { write: (chunk: string | Uint8Array) => ((stdout += String(chunk)), true) },
      stderr: { write: (chunk: string | Uint8Array) => ((stderr += String(chunk)), true) },
    },
    stdout: () => stdout,
    stderr: () => stderr,
  };
}
