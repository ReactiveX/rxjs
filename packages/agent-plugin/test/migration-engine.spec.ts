import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { defaultCapabilityRegistry } from '../src/migration/capabilities.js';
import { diagnosticForOffsets, parseDiagnostics, sortDiagnostics } from '../src/migration/diagnostics.js';
import { migrateMochaChaiToVitest } from '../src/migration/mocha-chai-vitest.js';
import { normalizeSelectedCase } from '../src/migration/normalize.js';
import { migrateTestSource } from '../src/migration/project.js';
import {
  assessMigrationContractReadiness,
  parseCapabilityRegistry,
  parseMigrationContractManifest,
} from '../src/migration/schemas.js';
import { migrateTestSchedulerSemantics } from '../src/migration/semantics.js';
import { capabilityRegistryVersion, migrationEngineVersion } from '../src/migration/version.js';

describe('migration diagnostics', () => {
  it('reports stable one-based source spans', () => {
    const sourceFile = ts.createSourceFile('src/example.ts', 'const value = map(source);\n', ts.ScriptTarget.Latest, true);
    const start = sourceFile.text.indexOf('map');
    const diagnostic = diagnosticForOffsets(sourceFile, start, start + 3, {
      code: 'unsafe-binding',
      message: 'shadowed',
      severity: 'error',
      disposition: 'refused',
      refusalScope: 'transform',
      classification: 'harness-rewrite',
      nextAction: { code: 'review-source', message: 'Rename the binding.' },
    });

    expect(diagnostic.id).toBe('unsafe-binding:src/example.ts:14-17');
    expect(diagnostic.span).toEqual({
      file: 'src/example.ts',
      start: { offset: 14, line: 1, column: 15 },
      end: { offset: 17, line: 1, column: 18 },
    });
  });

  it('turns parse errors into deterministic file refusals', () => {
    const sourceFile = ts.createSourceFile('broken.ts', 'const value = ;', ts.ScriptTarget.Latest, true);
    const diagnostics = parseDiagnostics(sourceFile);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: 'malformed-source',
      severity: 'error',
      disposition: 'refused',
      refusalScope: 'file',
      span: { file: 'broken.ts' },
    });
  });

  it('orders diagnostics by file, offset, and code', () => {
    const sourceFile = ts.createSourceFile('b.ts', 'one two', ts.ScriptTarget.Latest, true);
    const input = {
      message: 'review',
      severity: 'warning',
      disposition: 'requires-review',
      refusalScope: 'none',
      classification: 'compatibility-only',
      nextAction: { code: 'review-source', message: 'Review it.' },
    } as const;
    const later = diagnosticForOffsets(sourceFile, 4, 7, { ...input, code: 'lifecycle-review' });
    const earlier = diagnosticForOffsets(sourceFile, 0, 3, { ...input, code: 'scheduler-argument' });
    expect(sortDiagnostics([later, earlier]).map(({ id }) => id)).toEqual([earlier.id, later.id]);
  });
});

describe('migration normalization', () => {
  it('inlines one-element parameter loops and selected bindings', () => {
    const result = normalizeSelectedCase(`for (const mode of ['cold']) { await run(mode, selectedCase); }`, {
      bindings: { selectedCase: 7 },
    });
    expect(result).toContain("const mode = 'cold'");
    expect(result).toContain('await run(mode, 7)');
    expect(result).not.toContain('for (');
  });
});

describe('migration schemas', () => {
  const span = {
    file: 'src/example.ts',
    start: { offset: 0, line: 1, column: 1 },
    end: { offset: 6, line: 1, column: 7 },
  } as const;

  it('keeps the engine version synchronized with package metadata', async () => {
    const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    expect(migrationEngineVersion).toBe(packageJson.version);
  });

  it('validates and deeply freezes the default capability registry', () => {
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

  it('validates manifest references, repository-relative spans, approvals, and readiness', () => {
    const manifest = {
      schemaVersion: 1,
      engineVersion: migrationEngineVersion,
      skillDigest: 'a'.repeat(64),
      sourceRxjsVersion: '7.8.2',
      targetRxjsVersion: migrationEngineVersion,
      capabilityRegistryVersion,
      baseline: [
        {
          id: 'baseline:test',
          command: 'pnpm test',
          environment: { node: '24.12.0' },
          status: 'passed',
          exitCode: 0,
          summary: 'green',
        },
      ],
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
      blockers: [
        {
          owner: 'maintainer',
          reason: 'lifecycle decision',
          unitIds: ['pipeline:one'],
          evidence: ['test'],
          accepted: false,
        },
      ],
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
          approval: {
            status: 'approved',
            approvedBy: 'maintainer',
            approvedAt: '2026-07-31T00:00:00Z',
            rationale: 'Reviewed.',
          },
        },
      ],
      verification: [
        {
          id: 'target:test',
          command: 'pnpm test',
          environment: { node: '24.12.0' },
          status: 'passed',
          exitCode: 0,
          summary: 'green',
        },
      ],
      blockers: [],
    });
    expect(assessMigrationContractReadiness(readyManifest)).toEqual({ state: 'ready', findings: [] });
    expect(() =>
      parseMigrationContractManifest({
        ...readyManifest,
        units: [
          {
            ...readyManifest.units[0],
            approval: { status: 'approved', approvedBy: 'maintainer', rationale: 'Missing timestamp.' },
          },
        ],
      })
    ).toThrow(/approval timestamp/);
  });
});

describe('migration semantics', () => {
  it('refuses a capability registry produced for another engine', () => {
    const source = "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value => value));\n";
    const result = migrateTestSchedulerSemantics(source, {
      capabilityRegistry: { ...defaultCapabilityRegistry, engineVersion: 'other-engine' },
    });
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics[0]?.code).toBe('invalid-capability-registry');
  });

  it('creates a direct awaited rxTest body with exact Symbol composition and provenance', () => {
    const source = `
      import { expect } from 'chai';
      import { TestScheduler } from 'rxjs/testing';
      import { map, bufferCount } from 'rxjs/operators';
      let scheduler: TestScheduler;
      beforeEach(() => { scheduler = new TestScheduler(() => {}); });
      it('maps and buffers', () => {
        scheduler.run(({ cold, expectObservable }) => {
          const source = cold('-a-b-c-|');
          expectObservable(source.pipe(map(x => x), bufferCount(2))).toBe('-x-y|');
        });
      });
    `;
    const result = migrateTestSource(source, {
      mode: 'cold',
      provenance: { repository: 'https://example.test/project.git', sha: 'abc123', path: 'test/value-spec.ts' },
    });

    expect(result.code).toContain('// Migrated from https://example.test/project.git @ abc123');
    expect(result.code).toContain('// Source: test/value-spec.ts');
    expect(result.code).toContain('import { rxTest } from "@rxjs/test"');
    expect(result.code).toContain('import { map } from "rxjs/map"');
    expect(result.code).toContain('import { buffer } from "rxjs/buffer"');
    expect(result.code).toContain('async () =>');
    expect(result.code).toContain('await rxTest');
    expect(result.code).toContain('source[map](x => x)[buffer]({ maxSize: 2, startEvery: 2, emitRemainingOnError: false })');
    expect(result.code).not.toContain('TestScheduler');
  });

  it('does not rewrite unrelated run methods, cold identifiers, or flush calls', () => {
    const source = `
      import { TestScheduler } from 'rxjs/testing';
      let scheduler: TestScheduler;
      const cold = () => 'unrelated';
      const flush = () => 'unrelated';
      task.run(() => cold());
      flush();
      it('platform', () => scheduler.run(({ cold, expectObservable }) => {
        const source = cold('-a|');
        expectObservable(source).toBe('-a|');
      }));
    `;
    const result = migrateTestSchedulerSemantics(source, { mode: 'platform' });
    expect(result.code).toContain('task.run(() => cold())');
    expect(result.code).toContain("const cold = () => 'unrelated'");
    expect(result.code).toContain("const flush = () => 'unrelated'");
    expect(result.code).toContain('flush();');
    expect(result.code).toContain('({ observable, expectObservable })');
    expect(result.code).toContain("observable('-a|')");
  });

  it('preserves hooks with another responsibility and flags manual scheduler review', () => {
    const source = `
      import { TestScheduler } from 'rxjs/testing';
      let scheduler: TestScheduler;
      beforeEach(() => { resetFixture(); scheduler = new TestScheduler(() => {}); });
    `;
    const result = migrateTestSchedulerSemantics(source, { mode: 'cold' });
    expect(result.code).toContain('resetFixture()');
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'manual-test-scheduler' }));
  });

  it('tracks scheduler declarations nested in suites and aliased imports', () => {
    const nested = `
      import { TestScheduler } from 'rxjs/testing';
      describe('nested', () => {
        let scheduler: TestScheduler;
        beforeEach(() => { scheduler = new TestScheduler(() => {}); });
        it('runs', () => { scheduler.run(({ cold }) => cold('-a|')); });
      });
    `;
    const aliased = `import { TestScheduler as TS } from 'rxjs/testing'; let scheduler: TS; beforeEach(() => { scheduler = new TS(() => {}); }); it('x', () => scheduler.run(({ cold }) => cold('-a|')));`;
    expect(migrateTestSchedulerSemantics(nested).code).toContain('await rxTest');
    const aliasedResult = migrateTestSchedulerSemantics(aliased);
    expect(aliasedResult.code).toContain('await rxTest');
    expect(aliasedResult.code).not.toContain('TestScheduler');
    expect(aliasedResult.code).not.toContain('new TS');
  });

  it('emits a self-contained concatAll migration', () => {
    const result = migrateTestSchedulerSemantics(
      `import { concatAll } from 'rxjs/operators';\nconst result = source.pipe(concatAll());\n`
    );
    expect(result.code).toContain('source[mergeMap](inner => inner, { concurrent: 1 })');
    expect(result.code).not.toContain('identity');
  });

  it.each([
    {
      name: 'malformed source',
      source: `import { map } from 'rxjs/operators'; const result = source.pipe(map(;`,
      code: 'malformed-source',
    },
    {
      name: 'mixed unsupported pipeline',
      source: `import { map, shareReplay } from 'rxjs/operators';\nconst result = source.pipe(map(x => x), shareReplay(1));\n`,
      code: 'missing-capability',
    },
    {
      name: 'shadowed operator binding',
      source: `import { map } from 'rxjs/operators';\nfunction project(map: () => unknown) { return source.pipe(map()); }\n`,
      code: 'unsafe-binding',
    },
    {
      name: 'generated import collision',
      source: `import { map as rxMap } from 'rxjs/operators';\nconst map = 1;\nconst result = source.pipe(rxMap(x => x));\n`,
      code: 'unsafe-binding',
    },
    {
      name: 'unsupported overload',
      source: `import { concatMap } from 'rxjs/operators';\nconst result = source.pipe(concatMap(project, resultSelector));\n`,
      code: 'unsupported-overload',
    },
  ])('refuses $name atomically', ({ source, code }) => {
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code }));
  });

  it('does not remove an import that remains in a refused pipeline or non-pipe use', () => {
    const mixed = `import { map, shareReplay } from 'rxjs/operators';\nconst safe = first.pipe(map(x => x));\nconst blocked = second.pipe(map(x => x), shareReplay(1));\n`;
    const nonPipe = `import { map } from 'rxjs/operators';\nconst operator = map(x => x);\nconst result = source.pipe(map(x => x));\n`;
    expect(migrateTestSchedulerSemantics(mixed)).toMatchObject({ status: 'refused', code: mixed });
    expect(migrateTestSchedulerSemantics(nonPipe)).toMatchObject({ status: 'refused', code: nonPipe });
  });

  it('defaults to cold, remains byte-idempotent, and records provenance once', () => {
    const scheduler = `import { TestScheduler } from 'rxjs/testing'; let scheduler: TestScheduler; scheduler.run(({ cold }) => cold('-a|'));`;
    const defaultResult = migrateTestSchedulerSemantics(scheduler);
    expect(defaultResult.status).toBe('changed');
    expect(defaultResult.code).toContain('rxTest');

    const source = `import { map } from 'rxjs/operators';\nconst result = source.pipe(map(x => x));\n`;
    const options = {
      provenance: { repository: 'https://example.test/project.git', sha: 'abc123', path: 'src/example.ts' },
    } as const;
    const first = migrateTestSource(source, options);
    const second = migrateTestSource(first.code, options);
    const conflict = migrateTestSource(first.code, { provenance: { ...options.provenance, sha: 'different' } });
    expect(second).toMatchObject({ status: 'unchanged', code: first.code, diagnostics: [] });
    expect(first.code.match(/\/\/ Migrated from/g)).toHaveLength(1);
    expect(conflict).toMatchObject({ status: 'refused', code: first.code });
    expect(conflict.diagnostics).toContainEqual(expect.objectContaining({ code: 'conflicting-provenance' }));
  });

  it('refuses mixed TestScheduler declarations instead of deleting unrelated state', () => {
    const source = `import { TestScheduler } from 'rxjs/testing'; let scheduler: TestScheduler, other = 1; scheduler.run(({ cold }) => cold('-a|'));`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'manual-test-scheduler' }));
  });
});

describe('Mocha, Chai, and Sinon migration adapter', () => {
  it('converts supported assertions and spies to ordinary Vitest APIs', () => {
    const source = `
      import { expect } from 'chai';
      import sinon from 'sinon';
      const spy = sinon.spy();
      const stub = sinon.stub().callsFake(() => 1);
      expect(1).to.equal(1);
      expect(true).to.be.true;
      expect([]).to.be.empty;
      expect({ a: 1 }).to.deep.equal({ a: 1 });
      expect({ a: 1 }).to.have.property('a', 1);
      expect('abc').to.match(/a/);
      expect(() => { throw new Error('x'); }).to.throw();
      expect(spy).to.have.callCount(0);
    `;
    const result = migrateMochaChaiToVitest(source);
    for (const expected of [
      'from "vitest"',
      'vi.fn()',
      'vi.fn(() => 1)',
      'expect(1).toBe(1)',
      'expect(true).toBe(true)',
      'expect([]).toHaveLength(0)',
      'toEqual({ a: 1 })',
      "toHaveProperty('a', 1)",
      'toMatch(/a/)',
      'toThrow()',
      'toHaveBeenCalledTimes(0)',
    ]) {
      expect(result.code).toContain(expected);
    }
    expect(result.code).not.toContain("from 'chai'");
  });

  it.each([
    [`import { expect, assert } from 'chai'; expect(value).to.have.keys('a'); assert.ok(value);`, 'unsupported-framework-feature'],
    [`import { expect } from 'chai'; function check(expect: unknown) { return expect; } expect(1).to.equal(1);`, 'unsafe-binding'],
    [`import { expect } from 'chai'; expect(value).to.be.ok;`, 'unsupported-framework-feature'],
  ])('refuses unsupported or shadowed framework source atomically', (source, code) => {
    const result = migrateMochaChaiToVitest(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code }));
  });

  it('supports aliased Chai and Sinon bindings', () => {
    const chai = migrateMochaChaiToVitest(`import { expect as chaiExpect } from 'chai'; chaiExpect(1).to.equal(1);`);
    const sinon = migrateMochaChaiToVitest(`import s from 'sinon'; const spy = s.spy();`);
    expect(chai.code).toContain('expect(1).toBe(1)');
    expect(chai.code).not.toContain('chaiExpect');
    expect(sinon.code).toContain('vi.fn()');
    expect(sinon.code).not.toContain('s.spy()');
  });

  it('leaves migrated and unrelated local APIs byte-identical', () => {
    const migrated = `import { expect } from 'vitest';\nexpect(1).toBe(1);\n`;
    expect(migrateMochaChaiToVitest(migrated)).toEqual({
      status: 'unchanged',
      code: migrated,
      diagnostics: [],
      imports: [],
    });
    const local = `import 'mocha'; const sinon = { spy: () => 1 }; const value = sinon.spy();`;
    expect(migrateMochaChaiToVitest(local).code).toContain('sinon.spy()');
  });
});
