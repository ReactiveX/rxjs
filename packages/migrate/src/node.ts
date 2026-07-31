import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { migrateTestSource } from './index.js';
import type { MigrationResult, ProjectMigrationOptions, SourceProvenance } from './types.js';

export interface OutputNameContext {
  readonly sourcePath: string;
  readonly sourceRoot: string;
  readonly mode: 'cold' | 'platform';
}

export type OutputNamePolicy = (context: OutputNameContext) => string;

export interface MigrateFilesOptions extends Omit<ProjectMigrationOptions, 'provenance'> {
  readonly files: readonly string[];
  readonly sourceRoot: string;
  readonly outputRoot?: string;
  readonly sourceRepository: string;
  readonly sourceSha: string;
  readonly write?: boolean;
  readonly outputName?: OutputNamePolicy;
}

export interface MigratedFile {
  readonly sourcePath: string;
  readonly outputPath: string;
  readonly result: MigrationResult;
}

export const localSpecOutputName: OutputNamePolicy = ({ sourcePath, sourceRoot, mode }) => {
  const localPath = relative(sourceRoot, sourcePath).replaceAll('\\', '/');
  const extension = extname(localPath);
  const stem = localPath.slice(0, -extension.length).replace(/-spec$/, '');
  return `${stem}.${mode}.spec.ts`;
};

export async function migrateTestFiles(options: MigrateFilesOptions): Promise<readonly MigratedFile[]> {
  if (options.write && !options.outputRoot) {
    throw new Error('outputRoot is required when write is enabled.');
  }
  const sourceRoot = resolve(options.sourceRoot);
  const outputRoot = resolve(options.outputRoot ?? sourceRoot);
  const outputName = options.outputName ?? localSpecOutputName;
  const mode = options.mode ?? 'cold';
  const migrated: MigratedFile[] = [];

  for (const input of options.files) {
    const sourcePath = resolve(input);
    const source = await readFile(sourcePath, 'utf8');
    const localSourcePath = relative(sourceRoot, sourcePath).replaceAll('\\', '/');
    const provenance: SourceProvenance = {
      repository: options.sourceRepository,
      sha: options.sourceSha,
      path: localSourcePath,
    };
    const result = migrateTestSource(source, { ...options, mode, provenance });
    const outputPath = resolve(outputRoot, outputName({ sourcePath, sourceRoot, mode }));
    if (options.write) {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, result.code, 'utf8');
    }
    migrated.push({ sourcePath, outputPath, result });
  }

  return migrated;
}
