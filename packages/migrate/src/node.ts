import { lstat, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { migrateTestSource } from './index.js';
import type { MigrationResult, ProjectMigrationOptions, SourceProvenance } from './types.js';

export interface OutputNameContext {
  readonly sourcePath: string;
  readonly sourceRoot: string;
  readonly mode: 'cold' | 'platform' | 'unselected';
}

export type OutputNamePolicy = (context: OutputNameContext) => string;

export interface MigrateFilesOptions extends Omit<ProjectMigrationOptions, 'provenance'> {
  readonly files: readonly string[];
  readonly sourceRoot: string;
  readonly outputRoot?: string;
  readonly sourceRepository: string;
  readonly sourceSha: string;
  readonly write?: boolean;
  readonly overwrite?: boolean;
  readonly outputName?: OutputNamePolicy;
}

export interface MigratedFile {
  readonly sourcePath: string;
  readonly outputPath: string;
  readonly result: MigrationResult;
}

export interface MigrationFilePlan {
  readonly sourceRoot: string;
  readonly outputRoot: string;
  readonly files: readonly MigratedFile[];
}

export interface ApplyMigrationPlanOptions {
  readonly overwrite?: boolean;
}

interface PlannedSource {
  readonly sourcePath: string;
  readonly canonicalSourcePath: string;
  readonly localSourcePath: string;
  readonly source: string;
}

export const localSpecOutputName: OutputNamePolicy = ({ sourcePath, sourceRoot, mode }) => {
  const localPath = relative(sourceRoot, sourcePath).replaceAll('\\', '/');
  const extension = extname(localPath);
  const stem = (extension ? localPath.slice(0, -extension.length) : localPath).replace(/-spec$/, '');
  return `${stem}.${mode}.spec.ts`;
};

/**
 * Resolves, validates, reads, and transforms an entire migration batch without
 * mutating the destination tree.
 */
export async function planMigrationFiles(options: MigrateFilesOptions): Promise<MigrationFilePlan> {
  const sourceRoot = resolve(options.sourceRoot);
  const outputRoot = resolve(options.outputRoot ?? sourceRoot);
  const canonicalSourceRoot = await canonicalDirectory(sourceRoot, 'sourceRoot');
  const canonicalOutputRoot = await canonicalFutureDirectory(outputRoot, 'outputRoot');
  const outputName = options.outputName ?? localSpecOutputName;
  const outputMode = options.mode ?? 'unselected';
  const sources: PlannedSource[] = [];
  const canonicalSources = new Set<string>();

  for (const input of options.files) {
    const sourcePath = resolve(sourceRoot, input);
    assertContained(sourceRoot, sourcePath, `Source path is outside sourceRoot: ${input}`);

    const canonicalSourcePath = await realpath(sourcePath);
    assertContained(canonicalSourceRoot, canonicalSourcePath, `Source path resolves outside sourceRoot: ${input}`);
    if (canonicalSources.has(canonicalSourcePath)) {
      throw new Error(`Duplicate source path: ${input}`);
    }
    canonicalSources.add(canonicalSourcePath);

    const sourceStats = await stat(canonicalSourcePath);
    if (!sourceStats.isFile()) throw new Error(`Source path is not a regular file: ${input}`);

    const localSourcePath = relative(sourceRoot, sourcePath).replaceAll('\\', '/');
    sources.push({
      sourcePath,
      canonicalSourcePath,
      localSourcePath,
      source: await readFile(canonicalSourcePath, 'utf8'),
    });
  }

  const files: MigratedFile[] = [];
  const canonicalOutputs = new Set<string>();
  for (const plannedSource of sources) {
    const outputLocalName = outputName({ sourcePath: plannedSource.sourcePath, sourceRoot, mode: outputMode });
    const outputPath = safeOutputPath(outputRoot, outputLocalName);
    const canonicalOutputPath = await canonicalFuturePath(outputPath);
    assertContained(canonicalOutputRoot, canonicalOutputPath, `Output path resolves outside outputRoot: ${outputLocalName}`);

    if (canonicalSources.has(canonicalOutputPath)) {
      throw new Error(`Output path aliases a source file: ${outputLocalName}`);
    }
    if (canonicalOutputs.has(canonicalOutputPath)) {
      throw new Error(`Duplicate output path: ${outputLocalName}`);
    }
    canonicalOutputs.add(canonicalOutputPath);

    const provenance: SourceProvenance = {
      repository: options.sourceRepository,
      sha: options.sourceSha,
      path: plannedSource.localSourcePath,
    };
    const result = migrateTestSource(plannedSource.source, {
      ...options,
      mode: options.mode,
      provenance,
      fileName: plannedSource.localSourcePath,
    });
    files.push({ sourcePath: plannedSource.sourcePath, outputPath, result });
  }

  return { sourceRoot, outputRoot, files };
}

/** Writes the exact transformed bytes contained in an already validated plan. */
export async function applyMigrationPlan(
  plan: MigrationFilePlan,
  options: ApplyMigrationPlanOptions = {}
): Promise<readonly MigratedFile[]> {
  await preflightPlanOutputs(plan, options);
  for (const { outputPath, result } of plan.files) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, result.code, 'utf8');
  }
  return plan.files;
}

async function preflightPlanOutputs(plan: MigrationFilePlan, options: ApplyMigrationPlanOptions): Promise<void> {
  const outputRoot = resolve(plan.outputRoot);
  const canonicalOutputRoot = await canonicalFutureDirectory(outputRoot, 'outputRoot');
  const canonicalOutputs = new Set<string>();
  for (const { sourcePath, outputPath, result } of plan.files) {
    if (result.status === 'refused') throw new Error(`Migration result was refused for source: ${sourcePath}`);
    const resolvedOutputPath = resolve(outputPath);
    if (resolvedOutputPath === outputRoot) throw new Error(`Output path must identify a file below outputRoot: ${outputPath}`);
    assertContained(outputRoot, resolvedOutputPath, `Output path is outside outputRoot: ${outputPath}`);
    const canonicalOutputPath = await canonicalFuturePath(resolvedOutputPath);
    assertContained(canonicalOutputRoot, canonicalOutputPath, `Output path resolves outside outputRoot: ${outputPath}`);
    if (canonicalOutputs.has(canonicalOutputPath)) throw new Error(`Duplicate output path: ${outputPath}`);
    canonicalOutputs.add(canonicalOutputPath);
    await assertWritableOutput(resolvedOutputPath, options.overwrite ?? false);
  }
}

async function assertWritableOutput(outputPath: string, overwrite: boolean): Promise<void> {
  try {
    const outputStats = await lstat(outputPath);
    if (outputStats.isSymbolicLink()) throw new Error(`Refusing to overwrite a symbolic link: ${outputPath}`);
    if (!outputStats.isFile()) throw new Error(`Output path is not a regular file: ${outputPath}`);
    if (!overwrite) throw new Error(`Output path already exists; enable overwrite explicitly: ${outputPath}`);
  } catch (error: unknown) {
    if (!isMissingPathError(error)) throw error;
  }
}

export async function migrateTestFiles(options: MigrateFilesOptions): Promise<readonly MigratedFile[]> {
  if (options.write && !options.outputRoot) {
    throw new Error('outputRoot is required when write is enabled.');
  }
  const plan = await planMigrationFiles(options);
  return options.write ? applyMigrationPlan(plan, { overwrite: options.overwrite }) : plan.files;
}

function safeOutputPath(outputRoot: string, outputName: string): string {
  if (!outputName || outputName === '.' || isAbsolute(outputName)) {
    throw new Error(`Output name must be a non-empty relative path: ${outputName || '<empty>'}`);
  }
  const outputPath = resolve(outputRoot, outputName);
  if (outputPath === outputRoot) throw new Error(`Output name must identify a file below outputRoot: ${outputName}`);
  assertContained(outputRoot, outputPath, `Output path is outside outputRoot: ${outputName}`);
  return outputPath;
}

function assertContained(root: string, candidate: string, message: string): void {
  const localPath = relative(root, candidate);
  if (localPath === '' || (localPath !== '..' && !localPath.startsWith(`..${sep}`) && !isAbsolute(localPath))) return;
  throw new Error(message);
}

async function canonicalDirectory(path: string, label: string): Promise<string> {
  const canonicalPath = await realpath(path);
  const pathStats = await stat(canonicalPath);
  if (!pathStats.isDirectory()) throw new Error(`${label} is not a directory: ${path}`);
  return canonicalPath;
}

async function canonicalFutureDirectory(path: string, label: string): Promise<string> {
  const resolved = await canonicalFuturePath(path);
  try {
    const pathStats = await stat(path);
    if (!pathStats.isDirectory()) throw new Error(`${label} is not a directory: ${path}`);
  } catch (error: unknown) {
    if (!isMissingPathError(error)) throw error;
  }
  return resolved;
}

/**
 * Resolves every existing prefix through realpath and appends only missing
 * path segments. This detects an existing symlink that redirects a future
 * output outside its declared root without creating any directory first.
 */
async function canonicalFuturePath(path: string): Promise<string> {
  const missing: string[] = [];
  let existing = path;
  let canonicalExisting: string | undefined;
  while (canonicalExisting === undefined) {
    try {
      canonicalExisting = await realpath(existing);
    } catch (error: unknown) {
      if (!isMissingPathError(error)) throw error;
      const parent = dirname(existing);
      if (parent === existing) throw error;
      missing.push(basename(existing));
      existing = parent;
    }
  }
  if (missing.length > 0) {
    const existingStats = await stat(canonicalExisting);
    if (!existingStats.isDirectory()) throw new Error(`An output path ancestor is not a directory: ${existing}`);
  }
  return resolve(canonicalExisting, ...missing.reverse());
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
