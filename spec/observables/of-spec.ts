/** @prettier */
import { expect } from 'chai';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { concatMap, delay, concatAll } from 'rxjs/operators';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {of} */
describe('of', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should create a cold observable that emits 1, 2, 3', () => {
    rxTestScheduler.run(({ expectObservable, time }) => {
      const delayValue = time('--|');

      const e1 = of(1, 2, 3).pipe(
        // for the purpose of making a nice diagram, spread out the synchronous emissions
        concatMap((x, i) => of(x).pipe(delay(i === 0 ? 0 : delayValue)))
      );
      const expected = 'x-y-(z|)';
      expectObservable(e1).toBe(expected, { x: 1, y: 2, z: 3 });
    });
  });

  it('should create an observable from the provided values', (done) => {
    const x = { foo: 'bar' };
    const expected = [1, 'a', x];
    let i = 0;

    of(1, 'a', x).subscribe({
      next: (y: any) => {
        expect(y).to.equal(expected[i++]);
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done();
      },
    });
  });

  it('should emit one value', (done) => {
    let calls = 0;

    of(42).subscribe({
      next: (x: number) => {
        expect(++calls).to.equal(1);
        expect(x).to.equal(42);
      },
      error: (err: any) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        done();
      },
    });
  });

  it('should handle an Observable as the only value', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = of(of('a', 'b', 'c'));
      const result = source.pipe(concatAll());
      expectObservable(result).toBe('(abc|)');
    });
  });

  it('should handle many Observable as the given values', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const source = of(of('a', 'b', 'c'), of('d', 'e', 'f'));

      const result = source.pipe(concatAll());
      expectObservable(result).toBe('(abcdef|)');
    });
  });
});
