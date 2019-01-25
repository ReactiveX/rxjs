import { expect } from 'chai';
import { defer, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TestScheduler } from '../testing/TestScheduler';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {defer} */
describe('defer', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('defer(() => Observable.of(a, b, c))')
  it('should defer the creation of a simple Observable', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const expected =    '-a--b--c--|';
      const e1 = defer(() => cold('-a--b--c--|'));
      expectObservable(e1).toBe(expected);
    });
  });

  it('should create an observable from the provided observable factory', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^          !';
      const expected =   '--a--b--c--|';

      const e1 = defer(() => source);

      expectObservable(e1).toBe(expected);
      expectSubscriptionsTo(source).toBe(sourceSubs);
    });
  });

  it('should create an observable from completed', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('|');
      const sourceSubs = '(^!)';
      const expected =   '|';

      const e1 = defer(() => source);

      expectObservable(e1).toBe(expected);
      expectSubscriptionsTo(source).toBe(sourceSubs);
    });
  });

  it('should accept factory returns promise resolves', done => {
    const expected = 42;
    const e1 = defer(() => {
      return new Promise<number>((resolve: any) => { resolve(expected); });
    });

    e1.subscribe({
      next: x => {
        expect(x).to.equal(expected);
        done();
      },
      error: () => {
        done(new Error('should not be called'));
      }
    });
  });

  it('should accept factory returns promise rejects', done => {
    const expected = 42;
    const e1 = defer(() => {
      return new Promise<number>((resolve: any, reject: any) => { reject(expected); });
    });

    e1.subscribe({
      next: () => {
        done(new Error('should not be called'));
      },
      error: x => {
        expect(x).to.equal(expected);
        done();
      },
      complete: () => {
        done(new Error('should not be called'));
      }
    });
  });

  it('should create an observable from error', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('#');
      const sourceSubs = '(^!)';
      const expected =   '#';

      const e1 = defer(() => source);

      expectObservable(e1).toBe(expected);
      expectSubscriptionsTo(source).toBe(sourceSubs);
    });
  });

  it('should create an observable when factory throws', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const e1 = defer(() => {
        throw 'error';
      });
      const expected = '#';

      expectObservable(e1).toBe(expected);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^     !     ';
      const expected =   '--a--b-     ';
      const unsub =      '^-----!     ';

      const e1 = defer(() => source);

      expectObservable(e1, unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(sourceSubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, cold, expectObservable, expectSubscriptionsTo }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^     !     ';
      const expected =   '--a--b-     ';
      const unsub =      '^-----!     ';

      const e1 = defer(() => source.pipe(
        mergeMap(x => of(x)),
        mergeMap(x => of(x))
      ));

      expectObservable(e1, unsub).toBe(expected);
      expectSubscriptionsTo(source).toBe(sourceSubs);
    });
  });
});
