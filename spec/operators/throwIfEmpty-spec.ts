/** @prettier */
import { expect } from 'chai';
import { EMPTY, of, EmptyError, defer, throwError, Observable } from 'rxjs';
import { throwIfEmpty, mergeMap, retry, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {throwIfEmpty} */
describe('throwIfEmpty', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  describe('with errorFactory', () => {
    it('should error when empty', () => {
      rxTestScheduler.run(({ cold, expectObservable }) => {
        const source = cold('----|');
        const expected = '   ----#';

        const result = source.pipe(throwIfEmpty(() => new Error('test')));

        expectObservable(result).toBe(expected, undefined, new Error('test'));
      });
    });

    it('should throw if empty', () => {
      const error = new Error('So empty inside');
      let thrown: any;

      EMPTY.pipe(throwIfEmpty(() => error)).subscribe({
        error(err) {
          thrown = err;
        },
      });

      expect(thrown).to.equal(error);
    });

    it('should NOT throw if NOT empty', () => {
      const error = new Error('So empty inside');
      let thrown: any;

      of('test')
        .pipe(throwIfEmpty(() => error))
        .subscribe({
          error(err) {
            thrown = err;
          },
        });

      expect(thrown).to.be.undefined;
    });

    it('should pass values through', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('----a---b---c---|');
        const sub1 = '       ^---------------!';
        const expected = '   ----a---b---c---|';

        const result = source.pipe(throwIfEmpty(() => new Error('test')));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe([sub1]);
      });
    });

    it('should never when never', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('-');
        const sub1 = '       ^';
        const expected = '   -';

        const result = source.pipe(throwIfEmpty(() => new Error('test')));

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe([sub1]);
      });
    });

    it('should error when empty', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('----|');
        const sub1 = '       ^---!';
        const expected = '   ----#';

        const result = source.pipe(throwIfEmpty(() => new Error('test')));

        expectObservable(result).toBe(expected, undefined, new Error('test'));
        expectSubscriptions(source.subscriptions).toBe([sub1]);
      });
    });

    it('should throw if empty after retry', () => {
      const error = new Error('So empty inside');
      let thrown: any;
      let sourceIsEmpty = false;

      const source = defer(() => {
        if (sourceIsEmpty) {
          return EMPTY;
        }
        sourceIsEmpty = true;
        return of(1, 2);
      });

      source
        .pipe(
          throwIfEmpty(() => error),
          mergeMap((value) => {
            if (value > 1) {
              return throwError(() => new Error());
            }

            return of(value);
          }),
          retry(1)
        )
        .subscribe({
          error(err) {
            thrown = err;
          },
        });

      expect(thrown).to.equal(error);
    });
  });

  describe('without errorFactory', () => {
    it('should throw EmptyError if empty', () => {
      let thrown: any;

      EMPTY.pipe(throwIfEmpty()).subscribe({
        error(err) {
          thrown = err;
        },
      });

      expect(thrown).to.be.instanceof(EmptyError);
    });

    it('should NOT throw if NOT empty', () => {
      let thrown: any;

      of('test')
        .pipe(throwIfEmpty())
        .subscribe({
          error(err) {
            thrown = err;
          },
        });

      expect(thrown).to.be.undefined;
    });

    it('should pass values through', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('----a---b---c---|');
        const sub1 = '       ^---------------!';
        const expected = '   ----a---b---c---|';

        const result = source.pipe(throwIfEmpty());

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe([sub1]);
      });
    });

    it('should never when never', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('-');
        const sub1 = '       ^';
        const expected = '   -';

        const result = source.pipe(throwIfEmpty());

        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe([sub1]);
      });
    });

    it('should error when empty', () => {
      rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const source = cold('----|');
        const sub1 = '       ^---!';
        const expected = '   ----#';

        const result = source.pipe(throwIfEmpty());

        expectObservable(result).toBe(expected, undefined, new EmptyError());
        expectSubscriptions(source.subscriptions).toBe([sub1]);
      });
    });

    it('should throw if empty after retry', () => {
      let thrown: any;
      let sourceIsEmpty = false;

      const source = defer(() => {
        if (sourceIsEmpty) {
          return EMPTY;
        }
        sourceIsEmpty = true;
        return of(1, 2);
      });

      source
        .pipe(
          throwIfEmpty(),
          mergeMap((value) => {
            if (value > 1) {
              return throwError(() => new Error());
            }

            return of(value);
          }),
          retry(1)
        )
        .subscribe({
          error(err) {
            thrown = err;
          },
        });

      expect(thrown).to.be.instanceof(EmptyError);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(throwIfEmpty(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
