import { expect } from 'chai';
import { of, Observable, Subscription } from 'rxjs';

describe('Observable', () => {
  it('should exist', () => {
    expect(Observable).to.exist;
  });

  it('should work for the simplest use case', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(v) { results.push(v); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });

  it('should work for the simplest use case without the new keyword', () => {
    const source = Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(v) { results.push(v); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
  });


  it('should be able to stop synchronous observables with the nexted subscription', () => {
    let calls = 0;
    const source = new Observable<number>(subscriber => {
      for (let i = 0; i < 10; i++) {
        if (subscriber.closed) {
          break;
        }
        calls++;
        subscriber.next(i);
      }
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(value, subscription) {
        if (value === 3) subscription.unsubscribe();
        results.push(value);
      },
      complete() {
        results.push('done');
      }
    });

    expect(calls).to.equal(4);
    expect(results).to.deep.equal([0, 1, 2, 3]);
  });

  it('should not allow calling next after complete', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
      subscriber.next(3);
    });

    const results: any[] = [];

    source.subscribe({
      next(v) { results.push(v); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 'done']);
  });

  it('should not allow calling next after error', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error(new Error('bad'));
      subscriber.next(3);
    });

    const results: any[] = [];
    let error: Error;

    source.subscribe({
      next(v) { results.push(v); },
      error(err) { error = err; },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2]);
    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('bad');
  });

  it('should not complete after early unsubscribe', () => {
    const source = new Observable<number>(subscriber => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const results: any[] = [];

    source.subscribe({
      next(v, subscription) {
        results.push(v);
        if (v === 2) subscription.unsubscribe();
      },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2]);
  });

  it('should call teardown when unsubscribed', () => {
    let teardowns = 0;
    const source = new Observable(() => {
      return () => {
        teardowns++;
      };
    });

    source.subscribe().unsubscribe();

    expect(teardowns).to.equal(1);
  });

  describe('forEach', () => {
    it('should handle values asynchronously', () => {
      const results: any[] = [];
      const promise = of(1, 2, 3).forEach(x => results.push(x))
        .then(() => {
          expect(results).to.deep.equal([1, 2, 3]);
        });

      expect(results).to.deep.equal([]);

      return promise;
    });

    it('should work with async functions', () => {
      const results: any[] = [];

      async function foo(source: Observable<number>) {
        const result = await source.forEach(
          value => results.push(value)
        )

        expect(result).to.be.undefined;
        expect(results).to.deep.equal([1, 2, 3]);
      };

      return foo(of(1, 2, 3));
    });

    describe('with optional subscription argument', () => {
      it('should work with async functions and throw for unsubscribe', () => {
        const results: any[] = [];

        async function foo(source: Observable<number>, subscription: Subscription) {
          let errorHit = false;
          try {
            const result = await source.forEach(
              value => results.push(value),
              subscription,
            )
          } catch (err) {
            expect(err.name).to.equal('AbortError');
            errorHit = true;
          }

          expect(errorHit).to.be.true;
        };

        const subs = new Subscription();

        const asyncObservable = new Observable<number>(o => {
          const id = setTimeout(() => {
            o.next(42);
            o.complete();
          });
          return () => clearTimeout(id);
        });

        const final = foo(asyncObservable, subs);

        subs.unsubscribe();

        return final;
      });
    });
  });
});
