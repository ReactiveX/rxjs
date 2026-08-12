import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { defaultCapabilityRegistry } from './capabilities.js';
import { assessMigrationContractReadiness, parseCapabilityRegistry, parseMigrationContractManifest } from './schemas.js';
import { capabilityRegistryVersion, migrationEngineVersion } from './version.js';

const span = {
  file: 'src/example.ts',
  start: { offset: 0, line: 1, column: 1 },
  end: { offset: 6, line: 1, column: 7 },
} as const;

describe('migration schemas', () => {
  it('keeps the engine version synchronized with package metadata', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    expect(migrationEngineVersion).toBe(packageJson.version);
  });

  it('validates the versioned default capability registry', () => {
    expect(parseCapabilityRegistry(defaultCapabilityRegistry)).toEqual(defaultCapabilityRegistry);
    expect(Object.isFrozen(defaultCapabilityRegistry)).toBe(true);
    expect(Object.isFrozen(defaultCapabilityRegistry.capabilities)).toBe(true);
    expect(() =>
      parseCapabilityRegistry({
        ...defaultCapabilityRegistry,
        capabilities: [defaultCapabilityRegistry.capabilities[0], defaultCapabilityRegistry.capabilities[0]],
      })
    ).toThrow(/Duplicate legacy capability/);
  });

  it('validates references and escalation states in a contract manifest', () => {
    const manifest = {
      schemaVersion: 1,
      engineVersion: migrationEngineVersion,
      skillDigest: 'a'.repeat(64),
      sourceRxjsVersion: '7.8.2',
      targetRxjsVersion: migrationEngineVersion,
      capabilityRegistryVersion,
      baseline: [{ id: 'baseline:test', command: 'pnpm test', environment: { node: '24.12.0' }, status: 'passed', exitCode: 0, summary: 'green' }],
      units: [
        {
          id: 'pipeline:one',
          sourceLocations: [span],
          lifecycle: 'unresolved',
          evidenceClassification: 'compatibility-only',
          claims: ['producer multiplicity remains undecided'],
          approval: { status: 'pending' },
        },
      ],
      diagnostics: [],
      intentionalDivergences: [],
      verification: [],
      blockers: [{ owner: 'maintainer', reason: 'lifecycle decision', unitIds: ['pipeline:one'], evidence: ['test'], accepted: false }],
    } as const;

    expect(parseMigrationContractManifest(manifest)).toEqual(manifest);
    expect(() =>
      parseMigrationContractManifest({
        ...manifest,
        blockers: [{ ...manifest.blockers[0], unitIds: ['pipeline:missing'] }],
      })
    ).toThrow(/Unknown migration unit/);
    expect(() =>
      parseMigrationContractManifest({
        ...manifest,
        units: [{ ...manifest.units[0], approval: { status: 'not-required' } }],
      })
    ).toThrow(/require an explicit approval state/);
    expect(() =>
      parseMigrationContractManifest({
        ...manifest,
        units: [{ ...manifest.units[0], sourceLocations: [{ ...span, file: '../outside.ts' }] }],
      })
    ).toThrow(/repository-relative path/);

    expect(assessMigrationContractReadiness(manifest).state).toBe('incomplete');

    const readyManifest = parseMigrationContractManifest({
      ...manifest,
      units: [
        {
          ...manifest.units[0],
          lifecycle: 'platform-shared',
          approval: { status: 'approved', approvedBy: 'maintainer', approvedAt: '2026-07-31T00:00:00Z', rationale: 'Reviewed.' },
        },
      ],
      verification: [
        { id: 'target:test', command: 'pnpm test', environment: { node: '24.12.0' }, status: 'passed', exitCode: 0, summary: 'green' },
      ],
      blockers: [],
    });
    expect(assessMigrationContractReadiness(readyManifest)).toEqual({ state: 'ready', findings: [] });
    expect(() =>
      parseMigrationContractManifest({
        ...readyManifest,
        units: [{ ...readyManifest.units[0], approval: { status: 'approved', approvedBy: 'maintainer', rationale: 'Missing timestamp.' } }],
      })
    ).toThrow(/approval timestamp/);
  });
});
