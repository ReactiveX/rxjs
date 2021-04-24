/** @prettier */
import { expect } from 'chai';
import { defer, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {defer} */
describe('defer', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should defer the creation of a simple Observable', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const expected = '-a--b--c--|';
      const e1 = defer(() => cold('-a--b--c--|'));
      expectObservable(e1).toBe(expected);
    });
  });

  it('should create an observable from the provided observable factory', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^----------!';
      const expected = '  --a--b--c--|';

      const e1 = defer(() => source);

      expectObservable(e1).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should create an observable from completed', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('|');
      const sourceSubs = '(^!)';
      const expected = '  |';

      const e1 = defer(() => source);

      expectObservable(e1).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should accept factory returns promise resolves', (done) => {
    const expected = 42;
    const e1 = defer(() => {
      return new Promise<number>((resolve: any) => {
        resolve(expected);
      });
    });

    e1.subscribe(
      (x: number) => {
        expect(x).to.equal(expected);
        done();
      },
      (x: any) => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should accept factory returns promise rejects', (done) => {
    const expected = 42;
    const e1 = defer(() => {
      return new Promise<number>((resolve: any, reject: any) => {
        reject(expected);
      });
    });

    e1.subscribe(
      (x: number) => {
        done(new Error('should not be called'));
      },
      (x: any) => {
        expect(x).to.equal(expected);
        done();
      },
      () => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should create an observable from error', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('#');
      const sourceSubs = '(^!)';
      const expected = '  #';

      const e1 = defer(() => source);

      expectObservable(e1).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should create an observable when factory does not throw', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = defer(() => {
        if (1 !== Infinity) {
          throw 'error';
        }
        return of();
      });
      const expected = '#';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should error when factory throws', (done) => {
    const e1 = defer(() => {
      if (1 + 2 === 3) {
        throw 'error';
      }
      return of();
    });
    e1.subscribe({
      error: () => done(),
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^-----!     ';
      const expected = '  --a--b-     ';
      const unsub = '     ------!     ';

      const e1 = defer(() => source);

      expectObservable(e1, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^-----!     ';
      const expected = '  --a--b-     ';
      const unsub = '     ------!     ';

      const e1 = defer(() =>
        source.pipe(
          mergeMap((x: string) => of(x)),
          mergeMap((x: string) => of(x))
        )
      );

      expectObservable(e1, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
});
