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

  it('should connect a source through a selector function', () => {
    rxTest.run(({ cold, time, expectObservable }) => {
      const source = cold('---a----b-----c---|');
      const d = time('        ---|');
      const expected = '   ---a--a-b--b--c--c|';

      const result = source.pipe(connect((shared) => merge(shared.pipe(delay(d)), shared)));

      expectObservable(result).toBe(expected);
    });
  });

  it('should connect a source through a selector function and use the provided connector', () => {
    rxTest.run(({ cold, time, expectObservable }) => {
      const source = cold('--------a---------b---------c-----|');
      const d = time('             ---|');
      const expected = '   S--S----a--a------b--b------c--c--|';

      const result = source.pipe(
        connect(
          (shared) => {
            return merge(shared.pipe(delay(d)), shared);
          },
          {
            connector: () => new BehaviorSubject('S'),
          }
        )
      );

      expectObservable(result).toBe(expected);
    });
  });
});
