import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { query } from '../../src/internal/operators/query';
import { QueryResult } from '../../src/internal/types';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {query} */
describe('query operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit loading and then data', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('  --a|', { a: 'value' });
      const expected = '      i-a|';

      const expectedValues = {
        i: { isLoading: true, data: null, error: null },
        a: { isLoading: false, data: 'value', error: null },
      };

      const result$ = source$.pipe(query());

      expectObservable(result$).toBe(expected, expectedValues);
    });
  });

  it('should emit loading and then error', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('  --#', {}, 'BOOM');
      const expected = '    i-(e|)';
      const expectedValues: Record<string, QueryResult<any>> = {
        i: { isLoading: true, data: null, error: null },
        e: { isLoading: false, data: null, error: 'BOOM' },
      };

      const result$ = source$.pipe(query());

      expectObservable(result$).toBe(expected, expectedValues);
    });
  });

  it('should complete after emitting data', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('  a---|', { a: 123 });
      const expected = '    (ia)|';
      const expectedValues = {
        i: { isLoading: true, data: null, error: null },
        a: { isLoading: false, data: 123, error: null },
      };

      const result$ = source$.pipe(query());

      expectObservable(result$).toBe(expected, expectedValues);
    });
  });
});
