import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyMigrationPlan, localSpecOutputName, migrateTestFiles, planMigrationFiles } from './node.js';

describe('migration file planning', () => {
  let fixtureRoot: string;
  let sourceRoot: string;
  let outputRoot: string;

  beforeEach(async () => {
    fixtureRoot = await mkdtemp(join(tmpdir(), 'rxjs-migrate-node-'));
    sourceRoot = join(fixtureRoot, 'source');
    outputRoot = join(fixtureRoot, 'output');
    await mkdir(sourceRoot);
  });

  afterEach(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });

  it('plans nested files without writing and applies the exact planned content', async () => {
    await writeSource('nested/example.ts');

    const plan = await planMigrationFiles(options(['nested/example.ts']));
    const file = plan.files[0];
    if (!file) throw new Error('Expected one planned file.');
    expect(file?.outputPath).toBe(join(outputRoot, 'nested/example.cold.spec.ts'));
    await expect(access(file.outputPath)).rejects.toMatchObject({ code: 'ENOENT' });

    const applied = await applyMigrationPlan(plan);
    expect(applied).toBe(plan.files);
    expect(await readFile(file.outputPath, 'utf8')).toBe(file.result.code);
    expect(file.result.code).toContain('// Source: nested/example.ts');
  });

  it('keeps extensionless source names intact', async () => {
    await writeSource('nested/example');

    const plan = await planMigrationFiles(options(['nested/example']));

    expect(plan.files[0]?.outputPath).toBe(join(outputRoot, 'nested/example.cold.spec.ts'));
    expect(localSpecOutputName({ sourcePath: join(sourceRoot, 'example'), sourceRoot, mode: 'platform' })).toBe(
      'example.platform.spec.ts'
    );
  });

  it('does not silently choose cold lifecycle semantics', async () => {
    await writeFile(
      join(sourceRoot, 'scheduler.ts'),
      "import { TestScheduler } from 'rxjs/testing';\nconst scheduler = new TestScheduler(() => undefined);\n"
    );

    const plan = await planMigrationFiles({ ...options(['scheduler.ts']), mode: undefined });

    expect(plan.files[0]?.outputPath).toBe(join(outputRoot, 'scheduler.unselected.spec.ts'));
    expect(plan.files[0]?.result.status).toBe('refused');
    expect(plan.files[0]?.result.diagnostics[0]?.code).toBe('lifecycle-review');
  });

  it('rejects lexical source and output traversal', async () => {
    await writeFile(join(fixtureRoot, 'outside.ts'), 'export const outside = true;\n');
    await writeSource('inside.ts');

    await expect(planMigrationFiles(options(['../outside.ts']))).rejects.toThrow('Source path is outside sourceRoot');
    await expect(
      planMigrationFiles({ ...options(['inside.ts']), outputName: () => '../outside-output.ts' })
    ).rejects.toThrow('Output path is outside outputRoot');
  });

  it('rejects source and output symlinks that resolve outside their roots', async () => {
    const outsideSource = join(fixtureRoot, 'outside.ts');
    await writeFile(outsideSource, 'export const outside = true;\n');
    await symlink(outsideSource, join(sourceRoot, 'linked.ts'));
    await expect(planMigrationFiles(options(['linked.ts']))).rejects.toThrow('Source path resolves outside sourceRoot');

    await writeSource('inside.ts');
    const outsideOutput = join(fixtureRoot, 'outside-output');
    await mkdir(outsideOutput);
    await mkdir(outputRoot);
    await symlink(outsideOutput, join(outputRoot, 'linked'));
    await expect(
      planMigrationFiles({ ...options(['inside.ts']), outputName: () => 'linked/result.ts' })
    ).rejects.toThrow('Output path resolves outside outputRoot');
  });

  it('rejects duplicate canonical sources and duplicate outputs', async () => {
    await writeSource('first.ts');
    await writeSource('second.ts');
    await symlink(join(sourceRoot, 'first.ts'), join(sourceRoot, 'first-link.ts'));

    await expect(planMigrationFiles(options(['first.ts', 'first-link.ts']))).rejects.toThrow('Duplicate source path');
    await expect(
      planMigrationFiles({ ...options(['first.ts', 'second.ts']), outputName: () => 'same.ts' })
    ).rejects.toThrow('Duplicate output path');
  });

  it('does not write an earlier file when a later file fails preflight', async () => {
    await writeSource('first.ts');
    await writeFile(join(fixtureRoot, 'outside.ts'), 'export const outside = true;\n');

    await expect(migrateTestFiles({ ...options(['first.ts', '../outside.ts']), write: true })).rejects.toThrow(
      'Source path is outside sourceRoot'
    );
    await expect(access(join(outputRoot, 'first.cold.spec.ts'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('does not apply refused results or overwrite existing outputs without explicit policy', async () => {
    await writeFile(join(sourceRoot, 'malformed.ts'), 'export const broken = ;\n');
    const refusedPlan = await planMigrationFiles(options(['malformed.ts']));
    expect(refusedPlan.files[0]?.result.status).toBe('refused');
    await expect(applyMigrationPlan(refusedPlan)).rejects.toThrow('Migration result was refused');
    await expect(access(join(outputRoot, 'malformed.cold.spec.ts'))).rejects.toMatchObject({ code: 'ENOENT' });

    await writeSource('existing.ts');
    const existingPlan = await planMigrationFiles(options(['existing.ts']));
    const existingFile = existingPlan.files[0];
    if (!existingFile) throw new Error('Expected one planned file.');
    await mkdir(outputRoot, { recursive: true });
    await writeFile(existingFile.outputPath, 'keep me\n');

    await expect(applyMigrationPlan(existingPlan)).rejects.toThrow('enable overwrite explicitly');
    expect(await readFile(existingFile.outputPath, 'utf8')).toBe('keep me\n');
    await applyMigrationPlan(existingPlan, { overwrite: true });
    expect(await readFile(existingFile.outputPath, 'utf8')).toBe(existingFile.result.code);
  });

  function options(files: readonly string[]) {
    return {
      files,
      sourceRoot,
      outputRoot,
      sourceRepository: 'https://example.test/repository.git',
      sourceSha: 'abc123',
      mode: 'cold' as const,
    };
  }

  async function writeSource(localPath: string): Promise<void> {
    const path = join(sourceRoot, localPath);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, 'export const value = 1;\n');
  }
});
