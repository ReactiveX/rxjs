/** @prettier */
import { BehaviorSubject, merge } from 'rxjs';
import { connect, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

describe('connect', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should connect a source through a setup function', () => {
    rxTest.run(({ cold, time, expectObservable }) => {
      const source = cold('---a----b-----c---|');
      const d = time('        ---|');
      const expected = '   ---a--a-b--b--c--c|';

      const result = source.pipe(
        connect({
          setup: (shared) => {
            return merge(shared.pipe(delay(d)), shared);
          },
        })
      );

      expectObservable(result).toBe(expected);
    });
  });

  it('should connect a source through a setup function and use the provided connector', () => {
    rxTest.run(({ cold, time, expectObservable }) => {
      const source = cold('--------a---------b---------c-----|');
      const d = time('             ---|');
      const expected = '   S--S----a--a------b--b------c--c--|';

      const result = source.pipe(
        connect({
          connector: () => new BehaviorSubject('S'),
          setup: (shared) => {
            return merge(shared.pipe(delay(d)), shared);
          },
        })
      );

      expectObservable(result).toBe(expected);
    });
  });
});
