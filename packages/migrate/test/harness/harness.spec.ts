import { appendFile, lstat, mkdir, mkdtemp, readFile, rm, stat, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectSkillInstallation, skillHarnessAdapters, skillHarnesses, synchronizeSkillInstallation } from '../../src/skill-install.js';
import { harnessSmokeFixtures } from './fixtures.js';

const canonicalSkillRoot = fileURLToPath(new URL('../../skill', import.meta.url));

describe('portable Skill harness adapters', () => {
  const temporaryRoots: string[] = [];

  afterEach(async () => {
    await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });

  it('publishes the complete bounded harness set without workflow forks', () => {
    expect(skillHarnesses).toEqual(['codex', 'claude', 'cursor']);

    const codex = skillHarnessAdapters.codex;
    const cursor = skillHarnessAdapters.cursor;
    expect(cursor.adapterId).toBe(codex.adapterId);
    expect(cursor.targetDirectory).toBe(codex.targetDirectory);
    expect([...codex.compatibleHarnesses].sort()).toEqual(['codex', 'cursor']);
    expect([...cursor.compatibleHarnesses].sort()).toEqual(['codex', 'cursor']);
  });

  it.each(harnessSmokeFixtures)('$harness: exposes discovery and invocation metadata', (fixture) => {
    const adapter = skillHarnessAdapters[fixture.harness];

    expect(`${adapter.targetDirectory}/SKILL.md`).toBe(fixture.discoveryPath);
    expect(adapter.explicitInvocation).toBe(fixture.explicitInvocation);
    expect(adapter.implicitInvocation).toBe(fixture.implicitInvocation);
  });

  it.each(harnessSmokeFixtures)('$harness: documents only the least privilege needed by the workflow', (fixture) => {
    const guidance = skillHarnessAdapters[fixture.harness].permissionGuidance.join('\n').toLowerCase();
    const expected = fixture.permissionExpectations;

    if (expected.repositoryRead) expect(guidance).toMatch(/read[^\n]*repositor|repositor[^\n]*read/);
    if (expected.reviewedPathsWrite) expect(guidance).toMatch(/write[^\n]*review|review[^\n]*write/);
    if (expected.localProjectCommands) expect(guidance).toMatch(/local[^\n]*(build|test|package)|(?:build|test|package)[^\n]*local/);
    if (expected.localToolsRequestedNotAssumed)
      expect(guidance).toMatch(/(?:request|confirm|detect)[^\n]*(?:tool|command)|(?:tool|command)[^\n]*(?:request|confirm|detect)/);
    if (expected.networkRequiresApproval) expect(guidance).toMatch(/network[^\n]*approv|approv[^\n]*network/);
    if (!expected.productionCredentials)
      expect(guidance).toMatch(/no[^\n]*production credential|production credential[^\n]*(?:not|never|without)/);
    if (!expected.projectMcpWrite) expect(guidance).toMatch(/no[^\n]*mcp[^\n]*write|mcp[^\n]*write[^\n]*(?:not|never|without)/);
    if (!expected.destructiveActions) expect(guidance).toMatch(/destructive[^\n]*(?:outside|not|never|without)/);
    if (!expected.externalPublication) expect(guidance).toMatch(/publication[^\n]*(?:outside|not|never|without)/);
  });

  it.each(harnessSmokeFixtures)('$harness: installs a discoverable byte-identical canonical workflow', async (fixture) => {
    const projectRoot = await temporaryRoot();
    const result = await synchronizeSkillInstallation({
      projectRoot,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'install',
    });

    expect(result.stateBefore).toBe('absent');
    expect(result.stateAfter).toBe('current');
    expect(result.changed).toBe(true);
    expect(result.targetPath).toBe(join(projectRoot, dirname(fixture.discoveryPath)));
    await expect(stat(join(result.targetPath, 'SKILL.md'))).resolves.toMatchObject({});
    expect((await lstat(result.targetPath)).isSymbolicLink()).toBe(false);
    expect((await lstat(join(result.targetPath, 'SKILL.md'))).isSymbolicLink()).toBe(false);
    await expect(stat(result.provenancePath)).resolves.toMatchObject({});

    const installedSkill = await readFile(join(result.targetPath, 'SKILL.md'), 'utf8');
    expect(frontmatterValue(installedSkill, 'name')).toBe('rxjs-next-migration');
    expect(frontmatterValue(installedSkill, 'description')).toContain('Migrate an RxJS 7');
    expect(fixture.explicitInvocation).toContain(frontmatterValue(installedSkill, 'name'));
    expect(fixture.implicitInvocation.toLowerCase()).toContain('migrate');
    await expectCanonicalBytes(result.targetPath, result.canonicalIntegrity.files);

    const inspected = await inspectSkillInstallation({ projectRoot, canonicalSkillRoot, harness: fixture.harness });
    expect(inspected.state).toBe('current');
    expect(inspected.canonicalIntegrity.digest).toBe(result.canonicalIntegrity.digest);
    expect(inspected.provenance).toEqual(result.provenance);
  });

  it('uses one canonical digest and workflow for Codex, Claude, and Cursor', async () => {
    const results = await Promise.all(
      harnessSmokeFixtures.map(async ({ harness }) => {
        const projectRoot = await temporaryRoot();
        return synchronizeSkillInstallation({ projectRoot, canonicalSkillRoot, harness, operation: 'install' });
      })
    );

    expect(new Set(results.map((result) => result.canonicalIntegrity.digest)).size).toBe(1);
    const canonicalSkill = await readFile(join(canonicalSkillRoot, 'SKILL.md'), 'utf8');
    for (const result of results) {
      expect(await readFile(join(result.targetPath, 'SKILL.md'), 'utf8')).toBe(canonicalSkill);
      expect(result.provenance?.digest).toBe(result.canonicalIntegrity.digest);
    }
  });

  it.each(harnessSmokeFixtures)('$harness: reports stale content and updates it without special filesystem privileges', async (fixture) => {
    const projectRoot = await temporaryRoot();
    const fixtureSkillRoot = await mutableCanonicalSkill();
    const installed = await synchronizeSkillInstallation({
      projectRoot,
      canonicalSkillRoot: fixtureSkillRoot,
      harness: fixture.harness,
      operation: 'install',
    });
    await appendFile(join(fixtureSkillRoot, 'SKILL.md'), '\nCanonical update.\n');

    const stale = await inspectSkillInstallation({
      projectRoot,
      canonicalSkillRoot: fixtureSkillRoot,
      harness: fixture.harness,
    });
    expect(stale.state).toBe('stale');

    const updated = await synchronizeSkillInstallation({
      projectRoot,
      canonicalSkillRoot: fixtureSkillRoot,
      harness: fixture.harness,
      operation: 'update',
    });
    expect(updated).toMatchObject({ stateBefore: 'stale', stateAfter: 'current', changed: true });
    expect(await readFile(join(installed.targetPath, 'SKILL.md'), 'utf8')).toContain('Canonical update.');
  });

  it.each(harnessSmokeFixtures)('$harness: refuses a locally modified copy until force is explicit', async (fixture) => {
    const projectRoot = await temporaryRoot();
    const installed = await synchronizeSkillInstallation({
      projectRoot,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'install',
    });
    await appendFile(join(installed.targetPath, 'SKILL.md'), '\nLocal edit.\n');

    const modified = await inspectSkillInstallation({ projectRoot, canonicalSkillRoot, harness: fixture.harness });
    expect(modified.state).toBe('modified');
    await expect(
      synchronizeSkillInstallation({ projectRoot, canonicalSkillRoot, harness: fixture.harness, operation: 'update' })
    ).rejects.toThrow(/modified/i);
    expect((await inspectSkillInstallation({ projectRoot, canonicalSkillRoot, harness: fixture.harness })).state).toBe('modified');

    const forced = await synchronizeSkillInstallation({
      projectRoot,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'update',
      force: true,
    });
    expect(forced).toMatchObject({ stateBefore: 'modified', stateAfter: 'current', changed: true });
    expect(await readFile(join(forced.targetPath, 'SKILL.md'), 'utf8')).not.toContain('Local edit.');
  });

  it('reports a copy with missing provenance as modified', async () => {
    const projectRoot = await temporaryRoot();
    const installed = await synchronizeSkillInstallation({
      projectRoot,
      canonicalSkillRoot,
      harness: 'codex',
      operation: 'install',
    });
    await unlink(installed.provenancePath);

    await expect(inspectSkillInstallation({ projectRoot, canonicalSkillRoot, harness: 'codex' })).resolves.toMatchObject({
      state: 'modified',
    });
  });

  it.each(harnessSmokeFixtures)('$harness: removes a current copy and protects local edits', async (fixture) => {
    const cleanProject = await temporaryRoot();
    const clean = await synchronizeSkillInstallation({
      projectRoot: cleanProject,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'install',
    });
    const removed = await synchronizeSkillInstallation({
      projectRoot: cleanProject,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'remove',
    });
    expect(removed).toMatchObject({ stateBefore: 'current', stateAfter: 'absent', changed: true });
    await expect(stat(clean.targetPath)).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(stat(clean.provenancePath)).rejects.toMatchObject({ code: 'ENOENT' });

    const modifiedProject = await temporaryRoot();
    const modified = await synchronizeSkillInstallation({
      projectRoot: modifiedProject,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'install',
    });
    await appendFile(join(modified.targetPath, 'SKILL.md'), '\nLocal edit.\n');
    await expect(
      synchronizeSkillInstallation({
        projectRoot: modifiedProject,
        canonicalSkillRoot,
        harness: fixture.harness,
        operation: 'remove',
      })
    ).rejects.toThrow(/modified/i);

    const forced = await synchronizeSkillInstallation({
      projectRoot: modifiedProject,
      canonicalSkillRoot,
      harness: fixture.harness,
      operation: 'remove',
      force: true,
    });
    expect(forced).toMatchObject({ stateBefore: 'modified', stateAfter: 'absent', changed: true });
  });

  async function temporaryRoot(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'rxjs-migrate-harness-'));
    temporaryRoots.push(root);
    return root;
  }

  async function mutableCanonicalSkill(): Promise<string> {
    const root = await temporaryRoot();
    const target = join(root, 'skill');
    await copyCanonicalTree(canonicalSkillRoot, target);
    return target;
  }
});

async function expectCanonicalBytes(installedRoot: string, files: readonly string[]): Promise<void> {
  for (const file of files) {
    expect(await readFile(join(installedRoot, file))).toEqual(await readFile(join(canonicalSkillRoot, file)));
  }
}

async function copyCanonicalTree(source: string, target: string): Promise<void> {
  const { cp } = await import('node:fs/promises');
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
}

function frontmatterValue(source: string, key: string): string {
  const value = source.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
  if (!value) throw new Error(`Missing ${key} in Skill frontmatter`);
  return value;
}
