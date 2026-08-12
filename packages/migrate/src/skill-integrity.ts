import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { migrationEngineVersion } from './version.js';

export const skillIntegritySchemaVersion = 1 as const;
export const skillProvenanceFileName = '.rxjs-migrate-skill.json';

export interface SkillIntegrity {
  readonly schemaVersion: typeof skillIntegritySchemaVersion;
  readonly packageName: '@rxjs/migrate';
  readonly packageVersion: string;
  readonly digestAlgorithm: 'sha256';
  readonly digest: string;
  readonly files: readonly string[];
}

/**
 * Hashes canonical Skill file names and bytes in a stable order. Symlinks are
 * refused so two installations cannot claim the same source while resolving
 * to different content outside the package.
 */
export async function inspectSkillIntegrity(skillRoot: string): Promise<SkillIntegrity> {
  const root = resolve(skillRoot);
  const canonicalRoot = await realpath(root);
  const files = await collectFiles(root, root);
  const hash = createHash('sha256');
  for (const file of files) {
    const absolutePath = resolve(root, file);
    const canonicalPath = await realpath(absolutePath);
    assertContained(canonicalRoot, canonicalPath);
    const content = await readFile(canonicalPath);
    hash.update(`${Buffer.byteLength(file)}:`, 'utf8');
    hash.update(file, 'utf8');
    hash.update(`${content.byteLength}:`, 'utf8');
    hash.update(content);
  }
  return {
    schemaVersion: skillIntegritySchemaVersion,
    packageName: '@rxjs/migrate',
    packageVersion: migrationEngineVersion,
    digestAlgorithm: 'sha256',
    digest: hash.digest('hex'),
    files,
  };
}

export async function verifySkillIntegrity(skillRoot: string, expected: SkillIntegrity): Promise<boolean> {
  const actual = await inspectSkillIntegrity(skillRoot);
  return (
    expected.schemaVersion === actual.schemaVersion &&
    expected.packageName === actual.packageName &&
    expected.packageVersion === actual.packageVersion &&
    expected.digestAlgorithm === actual.digestAlgorithm &&
    expected.digest === actual.digest &&
    JSON.stringify(expected.files) === JSON.stringify(actual.files)
  );
}

async function collectFiles(root: string, directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = resolve(directory, entry.name);
    const localPath = relative(root, absolutePath).replaceAll(sep, '/');
    if (localPath === skillProvenanceFileName) continue;
    const stats = await lstat(absolutePath);
    if (stats.isSymbolicLink()) throw new Error(`Canonical Skill content must not contain symbolic links: ${absolutePath}`);
    if (stats.isDirectory()) result.push(...(await collectFiles(root, absolutePath)));
    else if (stats.isFile()) result.push(localPath);
    else throw new Error(`Canonical Skill content must contain only regular files and directories: ${absolutePath}`);
  }
  return result.sort();
}

function assertContained(root: string, candidate: string): void {
  const localPath = relative(root, candidate);
  if (localPath === '' || (localPath !== '..' && !localPath.startsWith(`..${sep}`))) return;
  throw new Error(`Skill content resolves outside its canonical root: ${candidate}`);
}
