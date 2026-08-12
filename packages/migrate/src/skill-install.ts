import { cp, lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { inspectSkillIntegrity, skillIntegritySchemaVersion, skillProvenanceFileName, type SkillIntegrity } from './skill-integrity.js';

export const skillInstallSchemaVersion = 1 as const;
export type SkillHarness = 'codex' | 'claude' | 'cursor';
export type SkillInstallAdapter = 'agents' | 'claude';
export type SkillInstallAction = 'check' | 'install' | 'update' | 'remove';
export type SkillInstallState = 'absent' | 'current' | 'stale' | 'modified';

export const skillHarnesses = ['codex', 'claude', 'cursor'] as const satisfies readonly SkillHarness[];

const sharedPermissionGuidance = [
  'Read the selected repository and its checked-in instructions.',
  'Write only reviewed project paths inside the migration scope.',
  'Run local package-manager, build, type, lint, and test commands.',
  'Detect required local tools and request confirmation before assuming unfamiliar commands.',
  'Request developer approval before network or package-install access.',
  'No production credentials are required by this workflow.',
  'No project MCP write authority is required by this workflow.',
  'Destructive actions are outside the default permission set.',
  'External publication is outside the default permission set.',
] as const;

export const skillHarnessAdapters = {
  codex: {
    adapterId: 'agents',
    targetDirectory: '.agents/skills/rxjs-next-migration',
    compatibleHarnesses: ['codex', 'cursor'],
    explicitInvocation: '$rxjs-next-migration',
    implicitInvocation: 'Migrate this RxJS 7 project to RxJS Next.',
    permissionGuidance: sharedPermissionGuidance,
  },
  claude: {
    adapterId: 'claude',
    targetDirectory: '.claude/skills/rxjs-next-migration',
    compatibleHarnesses: ['claude'],
    explicitInvocation: '/rxjs-next-migration',
    implicitInvocation: 'Migrate this RxJS 7 project to RxJS Next.',
    permissionGuidance: sharedPermissionGuidance,
  },
  cursor: {
    adapterId: 'agents',
    targetDirectory: '.agents/skills/rxjs-next-migration',
    compatibleHarnesses: ['codex', 'cursor'],
    explicitInvocation: '/rxjs-next-migration',
    implicitInvocation: 'Migrate this RxJS 7 project to RxJS Next.',
    permissionGuidance: sharedPermissionGuidance,
  },
} as const;

export interface SkillInstallProvenance extends SkillIntegrity {
  readonly installSchemaVersion: typeof skillInstallSchemaVersion;
  readonly adapter: SkillInstallAdapter;
  readonly compatibleHarnesses: readonly SkillHarness[];
  readonly targetPath: string;
}

export interface SkillInstallOptions {
  readonly projectRoot: string;
  readonly canonicalSkillRoot: string;
  readonly harness: SkillHarness;
  readonly force?: boolean;
}

export interface SkillInstallResult {
  readonly action: SkillInstallAction;
  readonly adapter: SkillInstallAdapter;
  readonly compatibleHarnesses: readonly SkillHarness[];
  readonly targetPath: string;
  readonly provenancePath: string;
  readonly stateBefore: SkillInstallState;
  readonly stateAfter: SkillInstallState;
  readonly changed: boolean;
  readonly provenance: SkillInstallProvenance;
  readonly canonicalIntegrity: SkillIntegrity;
}

export interface SkillInstallationInspection {
  readonly state: SkillInstallState;
  readonly targetPath: string;
  readonly provenancePath: string;
  readonly provenance?: SkillInstallProvenance;
  readonly canonicalIntegrity: SkillIntegrity;
}

interface ResolvedInstallation {
  readonly projectRoot: string;
  readonly canonicalSkillRoot: string;
  readonly targetPath: string;
  readonly provenancePath: string;
  readonly adapter: SkillInstallAdapter;
  readonly compatibleHarnesses: readonly SkillHarness[];
  readonly provenance: SkillInstallProvenance;
}

export async function checkSkillInstallation(options: SkillInstallOptions): Promise<SkillInstallResult> {
  const installation = await resolveInstallation(options);
  const state = await installationState(installation);
  return resultFor('check', installation, state, state, false);
}

export async function inspectSkillInstallation(options: SkillInstallOptions): Promise<SkillInstallationInspection> {
  const installation = await resolveInstallation(options);
  const state = await installationState(installation);
  const provenance = state === 'absent' ? undefined : await tryReadProvenance(installation.provenancePath);
  return {
    state,
    targetPath: installation.targetPath,
    provenancePath: installation.provenancePath,
    ...(provenance ? { provenance } : {}),
    canonicalIntegrity: installation.provenance,
  };
}

export async function installSkill(options: SkillInstallOptions): Promise<SkillInstallResult> {
  const installation = await resolveInstallation(options);
  const state = await installationState(installation);
  if (state === 'current') return resultFor('install', installation, state, state, false);
  if (state !== 'absent' && !options.force) {
    throw new Error(`Refusing to install over a ${state} Skill copy at ${installation.targetPath}. Use update or explicit force.`);
  }
  await replaceInstallation(installation);
  return resultFor('install', installation, state, 'current', true);
}

export async function updateSkill(options: SkillInstallOptions): Promise<SkillInstallResult> {
  const installation = await resolveInstallation(options);
  const state = await installationState(installation);
  if (state === 'current') return resultFor('update', installation, state, state, false);
  if (state === 'modified' && !options.force) {
    throw new Error(`Refusing to overwrite a locally modified Skill copy at ${installation.targetPath} without explicit force.`);
  }
  await replaceInstallation(installation);
  return resultFor('update', installation, state, 'current', true);
}

export async function removeSkill(options: SkillInstallOptions): Promise<SkillInstallResult> {
  const installation = await resolveInstallation(options);
  const state = await installationState(installation);
  if (state === 'absent') return resultFor('remove', installation, state, state, false);
  if (state === 'modified' && !options.force) {
    throw new Error(`Refusing to remove a locally modified Skill copy at ${installation.targetPath} without explicit force.`);
  }
  await rm(installation.targetPath, { recursive: true, force: false });
  return resultFor('remove', installation, state, 'absent', true);
}

export function manageSkillInstallation(action: SkillInstallAction, options: SkillInstallOptions): Promise<SkillInstallResult> {
  switch (action) {
    case 'check':
      return checkSkillInstallation(options);
    case 'install':
      return installSkill(options);
    case 'update':
      return updateSkill(options);
    case 'remove':
      return removeSkill(options);
  }
}

export function synchronizeSkillInstallation(
  options: SkillInstallOptions & { readonly operation: SkillInstallAction }
): Promise<SkillInstallResult> {
  const { operation, ...installOptions } = options;
  return manageSkillInstallation(operation, installOptions);
}

function adapterFor(harness: SkillHarness): {
  readonly adapter: SkillInstallAdapter;
  readonly localPath: string;
  readonly compatibleHarnesses: readonly SkillHarness[];
} {
  const adapter = skillHarnessAdapters[harness];
  return { adapter: adapter.adapterId, localPath: adapter.targetDirectory, compatibleHarnesses: adapter.compatibleHarnesses };
}

async function resolveInstallation(options: SkillInstallOptions): Promise<ResolvedInstallation> {
  const projectRoot = resolve(options.projectRoot);
  const canonicalProjectRoot = await realpath(projectRoot);
  if (!(await stat(canonicalProjectRoot)).isDirectory()) throw new Error(`Project root is not a directory: ${projectRoot}`);

  const canonicalSkillRoot = await realpath(resolve(options.canonicalSkillRoot));
  if (!(await stat(canonicalSkillRoot)).isDirectory()) throw new Error(`Canonical Skill root is not a directory: ${canonicalSkillRoot}`);

  const adapter = adapterFor(options.harness);
  const targetPath = resolve(projectRoot, adapter.localPath);
  assertContained(projectRoot, targetPath, 'Skill target must remain below the project root.');
  const canonicalTargetPath = await canonicalFuturePath(targetPath);
  assertContained(canonicalProjectRoot, canonicalTargetPath, 'Skill target resolves outside the project root.');
  const integrity = await inspectSkillIntegrity(canonicalSkillRoot);
  const provenance: SkillInstallProvenance = {
    ...integrity,
    installSchemaVersion: skillInstallSchemaVersion,
    adapter: adapter.adapter,
    compatibleHarnesses: adapter.compatibleHarnesses,
    targetPath: adapter.localPath.replaceAll(sep, '/'),
  };
  return {
    projectRoot,
    canonicalSkillRoot,
    targetPath,
    provenancePath: join(targetPath, skillProvenanceFileName),
    adapter: adapter.adapter,
    compatibleHarnesses: adapter.compatibleHarnesses,
    provenance,
  };
}

async function installationState(installation: ResolvedInstallation): Promise<SkillInstallState> {
  let targetStats;
  try {
    targetStats = await lstat(installation.targetPath);
  } catch (error: unknown) {
    if (isMissingPathError(error)) return 'absent';
    throw error;
  }
  if (!targetStats.isDirectory() || targetStats.isSymbolicLink()) return 'modified';

  let recorded: SkillInstallProvenance;
  try {
    recorded = await readProvenance(installation.provenancePath);
  } catch {
    return 'modified';
  }
  let installedIntegrity: SkillIntegrity;
  try {
    installedIntegrity = await inspectSkillIntegrity(installation.targetPath);
  } catch {
    return 'modified';
  }
  if (!sameContent(installedIntegrity, recorded)) return 'modified';
  return sameProvenance(recorded, installation.provenance) ? 'current' : 'stale';
}

async function replaceInstallation(installation: ResolvedInstallation): Promise<void> {
  const parent = dirname(installation.targetPath);
  await mkdir(parent, { recursive: true });
  const canonicalParent = await realpath(parent);
  assertContained(await realpath(installation.projectRoot), canonicalParent, 'Skill target parent resolves outside the project root.');

  const stageParent = await mkdtemp(join(parent, '.rxjs-next-migration-stage-'));
  const stage = join(stageParent, 'skill');
  const backup = `${installation.targetPath}.backup-${process.pid}-${Date.now()}`;
  let backedUp = false;
  try {
    await cp(installation.canonicalSkillRoot, stage, { recursive: true, force: false, errorOnExist: true });
    await writeFile(join(stage, skillProvenanceFileName), `${JSON.stringify(installation.provenance, null, 2)}\n`, { flag: 'wx' });
    try {
      await rename(installation.targetPath, backup);
      backedUp = true;
    } catch (error: unknown) {
      if (!isMissingPathError(error)) throw error;
    }
    await rename(stage, installation.targetPath);
    if (backedUp) await rm(backup, { recursive: true, force: false });
  } catch (error: unknown) {
    if (backedUp) {
      try {
        await rename(backup, installation.targetPath);
      } catch {
        // Preserve the original error; a retained backup is safer than deletion.
      }
    }
    throw error;
  } finally {
    await rm(stageParent, { recursive: true, force: true });
  }
}

function parseProvenance(source: string): SkillInstallProvenance {
  const value = JSON.parse(source) as Partial<SkillInstallProvenance>;
  if (
    value.installSchemaVersion !== skillInstallSchemaVersion ||
    value.schemaVersion !== skillIntegritySchemaVersion ||
    value.packageName !== '@rxjs/migrate' ||
    typeof value.packageVersion !== 'string' ||
    value.digestAlgorithm !== 'sha256' ||
    typeof value.digest !== 'string' ||
    !Array.isArray(value.files) ||
    (value.adapter !== 'agents' && value.adapter !== 'claude') ||
    !Array.isArray(value.compatibleHarnesses) ||
    typeof value.targetPath !== 'string'
  ) {
    throw new Error('Invalid Skill installation provenance.');
  }
  return value as SkillInstallProvenance;
}

async function readProvenance(path: string): Promise<SkillInstallProvenance> {
  return parseProvenance(await readFile(path, 'utf8'));
}

async function tryReadProvenance(path: string): Promise<SkillInstallProvenance | undefined> {
  try {
    return await readProvenance(path);
  } catch {
    return undefined;
  }
}

function sameContent(left: SkillIntegrity, right: SkillIntegrity): boolean {
  return (
    left.digestAlgorithm === right.digestAlgorithm &&
    left.digest === right.digest &&
    JSON.stringify(left.files) === JSON.stringify(right.files)
  );
}

function sameIntegrity(left: SkillIntegrity, right: SkillIntegrity): boolean {
  return (
    left.schemaVersion === right.schemaVersion &&
    left.packageName === right.packageName &&
    left.packageVersion === right.packageVersion &&
    left.digestAlgorithm === right.digestAlgorithm &&
    left.digest === right.digest &&
    JSON.stringify(left.files) === JSON.stringify(right.files)
  );
}

function sameProvenance(left: SkillInstallProvenance, right: SkillInstallProvenance): boolean {
  return (
    sameIntegrity(left, right) &&
    left.installSchemaVersion === right.installSchemaVersion &&
    left.adapter === right.adapter &&
    left.targetPath === right.targetPath &&
    JSON.stringify(left.compatibleHarnesses) === JSON.stringify(right.compatibleHarnesses)
  );
}

function resultFor(
  action: SkillInstallAction,
  installation: ResolvedInstallation,
  stateBefore: SkillInstallState,
  stateAfter: SkillInstallState,
  changed: boolean
): SkillInstallResult {
  return {
    action,
    adapter: installation.adapter,
    compatibleHarnesses: installation.compatibleHarnesses,
    targetPath: installation.targetPath,
    provenancePath: installation.provenancePath,
    stateBefore,
    stateAfter,
    changed,
    provenance: installation.provenance,
    canonicalIntegrity: installation.provenance,
  };
}

function assertContained(root: string, candidate: string, message: string): void {
  const localPath = relative(root, candidate);
  if (localPath === '' || (localPath !== '..' && !localPath.startsWith(`..${sep}`) && !isAbsolute(localPath))) return;
  throw new Error(message);
}

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
      missing.push(relative(parent, existing));
      existing = parent;
    }
  }
  return resolve(canonicalExisting, ...missing.reverse());
}

function isMissingPathError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}
