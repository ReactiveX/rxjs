/** @prettier */
import { mergeMap, splitBy } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

describe('splitBy()', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should split values', () => {
    rxTest.run(({ cold, expectObservable }) => {
      const source = cold(' --a-b-c-a-b-c-|');
      const x = cold('      --a-----a-----|');
      const y = cold('      ----b-c---b-c-|');
      const expected = '    (xy)----------|';

      const split = source.pipe(
        splitBy((value) => value === 'a'),
        mergeMap((splits) => splits)
      );
      expectObservable(split).toBe(expected, { x, y });
    });
  });
});
