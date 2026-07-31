import { describe, expect, it } from 'vitest';
import { migrateTestSchedulerSemantics } from './semantics.js';

describe('migrateTestSchedulerSemantics', () => {
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
    const result = migrateTestSchedulerSemantics(source, {
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
    const result = migrateTestSchedulerSemantics(source);
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
    const result = migrateTestSchedulerSemantics(source);
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
});
