import { describe, expect, it } from 'vitest';
import { defaultCapabilityRegistry } from './capabilities.js';
import { migrateTestSource } from './index.js';
import { migrateTestSchedulerSemantics } from './semantics.js';

describe('migrateTestSchedulerSemantics', () => {
  it('refuses a capability registry produced for another engine', () => {
    const source = "import { map } from 'rxjs/operators';\nconst result = source.pipe(map(value => value));\n";
    const result = migrateTestSchedulerSemantics(source, {
      capabilityRegistry: { ...defaultCapabilityRegistry, engineVersion: 'other-engine' },
    });

    expect(result.status).toBe('refused');
    expect(result.code).toBe(source);
    expect(result.diagnostics[0]?.code).toBe('invalid-capability-registry');
  });
  it('creates a direct awaited rxTest body with Symbol composition and provenance', () => {
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
    expect(result.code).toContain('source[map]');
    expect(result.code).toContain('source[map](x => x)[buffer]({ maxSize: 2, startEvery: 2, emitRemainingOnError: false })');
    expect(result.code).not.toContain('TestScheduler');
  });

  it('does not rewrite unrelated run methods or unrelated cold identifiers', () => {
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

  it('preserves setup hooks that have another responsibility', () => {
    const source = `
      import { TestScheduler } from 'rxjs/testing';
      let scheduler: TestScheduler;
      beforeEach(() => { resetFixture(); scheduler = new TestScheduler(() => {}); });
    `;
    const result = migrateTestSchedulerSemantics(source, { mode: 'cold' });
    expect(result.code).toContain('resetFixture()');
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'manual-test-scheduler' }));
  });

  it('tracks TestScheduler declarations nested in suites', () => {
    const source = `
      import { TestScheduler } from 'rxjs/testing';
      describe('nested', () => {
        let scheduler: TestScheduler;
        beforeEach(() => { scheduler = new TestScheduler(() => {}); });
        it('runs', () => { scheduler.run(({ cold }) => cold('-a|')); });
      });
    `;
    const result = migrateTestSchedulerSemantics(source, { mode: 'cold' });
    expect(result.code).toContain('await rxTest');
    expect(result.code).not.toContain('scheduler.run');
  });

  it('emits a self-contained concatAll migration', () => {
    const result = migrateTestSchedulerSemantics(`
      import { concatAll } from 'rxjs/operators';
      const result = source.pipe(concatAll());
    `);

    expect(result.code).toContain('source[mergeMap](inner => inner, { concurrent: 1 })');
    expect(result.code).not.toContain('identity');
  });

  it('refuses malformed source without changing its bytes', () => {
    const source = `import { map } from 'rxjs/operators'; const result = source.pipe(map(;`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'malformed-source', refusalScope: 'file' }));
  });

  it('preserves a mixed unsupported pipeline and its imports atomically', () => {
    const source = `import { map, shareReplay } from 'rxjs/operators';\nconst result = source.pipe(map(x => x), shareReplay(1));\n`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result.status).toBe('refused');
    expect(result.code).toBe(source);
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'missing-capability', disposition: 'refused' }));
  });

  it('does not remove an operator import that remains in a refused pipeline or non-pipe use', () => {
    const mixed = `import { map, shareReplay } from 'rxjs/operators';\nconst safe = first.pipe(map(x => x));\nconst blocked = second.pipe(map(x => x), shareReplay(1));\n`;
    const nonPipe = `import { map } from 'rxjs/operators';\nconst operator = map(x => x);\nconst result = source.pipe(map(x => x));\n`;
    const mixedResult = migrateTestSchedulerSemantics(mixed);
    const nonPipeResult = migrateTestSchedulerSemantics(nonPipe);

    expect(mixedResult.status).toBe('refused');
    expect(mixedResult.code).toContain("import { map, shareReplay } from 'rxjs/operators'");
    expect(nonPipeResult).toMatchObject({ status: 'refused', code: nonPipe });
    expect(nonPipeResult.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsafe-binding' }));
  });

  it('refuses a shadowed operator binding', () => {
    const source = `import { map } from 'rxjs/operators';\nfunction project(map: () => unknown) { return source.pipe(map()); }\n`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsafe-binding', capabilityId: 'operator.map' }));
  });

  it('refuses a generated Symbol import that would collide with an existing binding', () => {
    const source = `import { map as rxMap } from 'rxjs/operators';\nconst map = 1;\nconst result = source.pipe(rxMap(x => x));\n`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsafe-binding' }));
  });

  it('refuses unsupported overloads instead of dropping arguments', () => {
    const source = `import { concatMap } from 'rxjs/operators';\nconst result = source.pipe(concatMap(project, resultSelector));\n`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'unsupported-overload' }));
  });

  it('requires an explicit lifecycle for TestScheduler migrations', () => {
    const source = `import { TestScheduler } from 'rxjs/testing'; let scheduler: TestScheduler; scheduler.run(({ cold }) => cold('-a|'));`;
    const result = migrateTestSchedulerSemantics(source);
    expect(result).toMatchObject({ status: 'refused', code: source });
    expect(result.diagnostics).toContainEqual(expect.objectContaining({ code: 'lifecycle-review', refusalScope: 'file' }));
  });

  it('tracks an aliased TestScheduler and refuses mixed declaration statements', () => {
    const aliased = `import { TestScheduler as TS } from 'rxjs/testing'; let scheduler: TS; beforeEach(() => { scheduler = new TS(() => {}); }); it('x', () => scheduler.run(({ cold }) => cold('-a|')));`;
    const mixed = `import { TestScheduler } from 'rxjs/testing'; let scheduler: TestScheduler, other = 1; scheduler.run(({ cold }) => cold('-a|'));`;
    const aliasedResult = migrateTestSchedulerSemantics(aliased, { mode: 'cold' });
    const mixedResult = migrateTestSchedulerSemantics(mixed, { mode: 'cold' });

    expect(aliasedResult.code).toContain('await rxTest');
    expect(aliasedResult.code).not.toContain('TestScheduler');
    expect(aliasedResult.code).not.toContain('new TS');
    expect(mixedResult).toMatchObject({ status: 'refused', code: mixed });
    expect(mixedResult.diagnostics).toContainEqual(expect.objectContaining({ code: 'manual-test-scheduler' }));
  });

  it('keeps a lifecycle refusal byte-identical through provenance handling', () => {
    const source = `import { TestScheduler } from 'rxjs/testing'; let scheduler: TestScheduler; scheduler.run(({ cold }) => cold('-a|'));`;
    const result = migrateTestSource(source, {
      provenance: { repository: 'https://example.test/project.git', sha: 'abc', path: 'test/example.ts' },
    });
    expect(result).toMatchObject({ status: 'refused', code: source });
  });

  it('is byte-idempotent after a successful transform', () => {
    const first = migrateTestSchedulerSemantics(`import { map } from 'rxjs/operators';\nconst result = source.pipe(map(x => x));\n`);
    const second = migrateTestSchedulerSemantics(first.code);
    expect(first.status).toBe('changed');
    expect(second).toMatchObject({ status: 'unchanged', code: first.code, diagnostics: [] });
  });

  it('adds matching provenance once and refuses conflicting provenance', () => {
    const source = `import { map } from 'rxjs/operators';\nconst result = source.pipe(map(x => x));\n`;
    const options = {
      provenance: { repository: 'https://example.test/project.git', sha: 'abc123', path: 'src/example.ts' },
    } as const;
    const first = migrateTestSource(source, options);
    const second = migrateTestSource(first.code, options);
    const conflict = migrateTestSource(first.code, {
      provenance: { ...options.provenance, sha: 'different' },
    });

    expect(second).toMatchObject({ status: 'unchanged', code: first.code, diagnostics: [] });
    expect(first.code.match(/\/\/ Migrated from/g)).toHaveLength(1);
    expect(conflict).toMatchObject({ status: 'refused', code: first.code });
    expect(conflict.diagnostics).toContainEqual(expect.objectContaining({ code: 'conflicting-provenance' }));
  });
});
