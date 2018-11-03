import { expect } from 'chai';
import { EMPTY, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { concatMap, delay, concatAll } from 'rxjs/operators';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {of} */
describe('of', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('of(1, 2, 3)')
  it('should create a cold observable that emits 1, 2, 3', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = of(1, 2, 3).pipe(
        // for the purpose of making a nice diagram, spread out the synchronous emissions
        concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : 2, testScheduler)))
      );
      const expected = 'x-y-(z|)';
      expectObservable(e1).toBe(expected, {x: 1, y: 2, z: 3});
    });
  });

  it('should create an observable from the provided values', done => {
    const x = { foo: 'bar' };
    const expected = [1, 'a', x];
    let i = 0;

    of(1, 'a', x)
      .subscribe(y => {
        expect(y).to.equal(expected[i++]);
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });

  it('should emit one value', done => {
    let calls = 0;

    of(42).subscribe((x: number) => {
      expect(++calls).to.equal(1);
      expect(x).to.equal(42);
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should handle an Observable as the only value', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = of(
        of('a', 'b', 'c')
      );
      const result = source.pipe(concatAll());
      expectObservable(result).toBe('(abc|)');
    });
  });

  it('should handle many Observable as the given values', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = of(
        of('a', 'b', 'c'),
        of('d', 'e', 'f'),

      );

      const result = source.pipe(concatAll());
      expectObservable(result).toBe('(abcdef|)');
    });
  });
});
