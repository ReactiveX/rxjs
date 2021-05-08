/** @prettier */
import { buckets, map, mergeAll } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

describe('buckets()', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  const lettersIntoBuckets = (bucketCount: number) =>
    buckets(bucketCount, { hashFn: (value: string) => value.charCodeAt(0) - 'a'.charCodeAt(0) });

  it('should bucket values', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' --a-b-c-a-b-c-|');
      const x = cold('      --a-----a-----|');
      const y = cold('      ----b-----b---|');
      const z = cold('      ------c-----c-|');
      const expected = '    (xyz)---------|';

      const bucketed = source.pipe(lettersIntoBuckets(3), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should forward errors for non-empty sources', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' --a-b--#');
      const x = cold('      --a----#');
      const y = cold('      ----b--#');
      const z = cold('      -------#');
      const expected = '    (xyz)--#';

      const bucketed = source.pipe(lettersIntoBuckets(3), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should forward errors for empty sources', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' #');
      const x = cold('      #');
      const y = cold('      #');
      const z = cold('      #');
      const expected = '    (xyz#)';

      const bucketed = source.pipe(lettersIntoBuckets(3), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should forward completions for empty sources', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' |     ');
      const x = cold('      |     ');
      const y = cold('      |     ');
      const z = cold('      |     ');
      const expected = '    (xyz|)';

      const bucketed = source.pipe(lettersIntoBuckets(3), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should handle hash values that exceed the count', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' --a----|');
      const x = cold('      -------|');
      const y = cold('      --a----|');
      const z = cold('      -------|');
      const expected = '    (xyz)--|';

      const bucketed = source.pipe(buckets(3, { hashFn: () => 4 }), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should handle negative hash values', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' --a----|');
      const x = cold('      -------|');
      const y = cold('      --a----|');
      const z = cold('      -------|');
      const expected = '    (xyz)--|';

      const bucketed = source.pipe(buckets(3, { hashFn: () => -1 }), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should handle floating-point hash values', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' --a----|');
      const x = cold('      -------|');
      const y = cold('      --a----|');
      const z = cold('      -------|');
      const expected = '    (xyz)--|';

      const bucketed = source.pipe(buckets(3, { hashFn: () => 1.5 }), mergeAll());

      expectObservable(bucketed).toBe(expected, { x, y, z });
    });
  });

  it('should forward errors thrown from the hash selector', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const error = new Error('Kaboom!');
      const source = cold(' ------a-|');
      const x = cold('      ------#  ', undefined, error);
      const y = cold('      ------#  ', undefined, error);
      const z = cold('      ------#  ', undefined, error);
      const expected = '    (xyz)-#  ';

      const bucketed = source.pipe(
        buckets(3, {
          hashFn: () => {
            throw error;
          },
        }),
        mergeAll()
      );
      expectObservable(bucketed).toBe(expected, { x, y, z }, error);
    });
  });

  it('should not subscribe to the source, if an error is thrown synchronously from downstream', () => {
    rxTest.run(({ cold, expectObservable, expectSubscriptions }) => {
      const error = new Error('Kaboom!');
      const source = cold(' ------a-|');
      const sourceSubs = '           ';
      const expected = '    #        ';

      const bucketed = source.pipe(
        buckets(3),
        map(() => {
          throw error;
        })
      );

      expectObservable(bucketed).toBe(expected, undefined, error);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
});
