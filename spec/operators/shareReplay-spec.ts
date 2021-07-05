/** @prettier */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { shareReplay, mergeMapTo, retry, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { Observable, Operator, Observer, of, from, defer, pipe } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {shareReplay} */
describe('shareReplay', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should mirror a simple source Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';

      const published = source.pipe(shareReplay());

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should do nothing if result is not subscribed', () => {
    let subscribed = false;
    const source = new Observable(() => {
      subscribed = true;
    });
    source.pipe(shareReplay());
    expect(subscribed).to.be.false;
  });

  it('should multicast the same values to multiple observers, bufferSize=1', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      ----23----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      --------3-4-|';

      const shared = source.pipe(shareReplay(1));

      expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
      expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
      expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast the same values to multiple observers, bufferSize=2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3------4-|');
      const sourceSubs = '     ^-----------------!';
      const subscriber1 = hot('a|                 ');
      const expected1 = '      -1-2-----3------4-|';
      const subscriber2 = hot('----b|             ');
      const expected2 = '      ----(12)-3------4-|';
      const subscriber3 = hot('-----------c|      ');
      const expected3 = '      -----------(23)-4-|';

      const shared = source.pipe(shareReplay(2));

      expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
      expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
      expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast an error from the source to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      ----23----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      --------3-4-#';

      const shared = source.pipe(shareReplay(1));

      expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
      expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
      expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast an empty source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';

      const shared = source.pipe(shareReplay(1));

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast a never source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const sourceSubs = ' ^';
      const expected = '   -';

      const shared = source.pipe(shareReplay(1));

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast a throw source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';

      const shared = source.pipe(shareReplay(1));

      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should replay results to subsequent subscriptions if source completes, bufferSize=2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3-|        ');
      const sourceSubs = '     ^----------!        ';
      const subscriber1 = hot('a|                  ');
      const expected1 = '      -1-2-----3-|        ';
      const subscriber2 = hot('----b|              ');
      const expected2 = '      ----(12)-3-|        ';
      const subscriber3 = hot('---------------(c|) ');
      const expected3 = '      ---------------(23|)';

      const shared = source.pipe(shareReplay(2));

      expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
      expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
      expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should completely restart for subsequent subscriptions if source errors, bufferSize=2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3-#               ');
      const sourceSubs1 = '    ^----------!               ';
      const subscriber1 = hot('a|                         ');
      const expected1 = '      -1-2-----3-#               ';
      const subscriber2 = hot('----b|                     ');
      const expected2 = '      ----(12)-3-#               ';
      const subscriber3 = hot('---------------(c|)        ');
      const expected3 = '      ----------------1-2-----3-#';
      const sourceSubs2 = '    ---------------^----------!';

      const shared = source.pipe(shareReplay(2));

      expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
      expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
      expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe([sourceSubs1, sourceSubs2]);
    });
  });

  it('should be retryable, bufferSize=2', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subs = [];
      const source = cold('    -1-2-----3-#                      ');
      subs.push('              ^----------!                      ');
      subs.push('              -----------^----------!           ');
      subs.push('              ----------------------^----------!');
      const subscriber1 = hot('a|                                ');
      const expected1 = '      -1-2-----3--1-2-----3-#           ';
      const subscriber2 = hot('----b|                            ');
      const expected2 = '      ----(12)-3--1-2-----3-#           ';
      const subscriber3 = hot('---------------(c|)               ');
      const expected3 = '      ---------------(12)-3--1-2-----3-#';

      const shared = source.pipe(shareReplay(2), retry(1));

      expectObservable(subscriber1.pipe(mergeMapTo(shared))).toBe(expected1);
      expectObservable(subscriber2.pipe(mergeMapTo(shared))).toBe(expected2);
      expectObservable(subscriber3.pipe(mergeMapTo(shared))).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('when no windowTime is given ReplaySubject should be in _infiniteTimeWindow mode', () => {
    const spy = sinon.spy(testScheduler, 'now');

    of(1).pipe(shareReplay(1, undefined, testScheduler)).subscribe();
    spy.restore();
    expect(spy, 'ReplaySubject should not call scheduler.now() when no windowTime is given').to.be.not.called;
  });

  it('should not restart due to unsubscriptions if refCount is false', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-b-c-d-e-f-g-h-i-j');
      const sourceSubs = ' ^------------------';
      const sub1 = '       ^------!           ';
      const expected1 = '  a-b-c-d-           ';
      const sub2 = '       -----------^-------';
      const expected2 = '  -----------fg-h-i-j';

      const shared = source.pipe(shareReplay({ bufferSize: 1, refCount: false }));

      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should restart due to unsubscriptions if refCount is true', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const sourceSubs = [];
      const source = cold('a-b-c-d-e-f-g-h-i-j           ');
      sourceSubs.push('    ^------!----------------------');
      sourceSubs.push('    -----------^------------------');
      const sub1 = '       ^------!                      ';
      const expected1 = '  a-b-c-d-                      ';
      const sub2 = '       -----------^------------------';
      const expected2 = '  -----------a-b-c-d-e-f-g-h-i-j';

      const shared = source.pipe(shareReplay({ bufferSize: 1, refCount: true }));

      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not restart due to unsubscriptions if refCount is true when the source has completed', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-(b|)         ');
      const sourceSubs = ' ^-!            ';
      const sub1 = '       ^------!       ';
      const expected1 = '  a-(b|)         ';
      const sub2 = '       -----------^!  ';
      const expected2 = '  -----------(b|)';

      const shared = source.pipe(shareReplay({ bufferSize: 1, refCount: true }));

      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not restart a synchronous source due to unsubscriptions if refCount is true when the source has completed', () => {
    // The test above this one doesn't actually test completely synchronous
    // behaviour because of this problem:
    // https://github.com/ReactiveX/rxjs/issues/5523

    let subscriptions = 0;
    const source = defer(() => {
      ++subscriptions;
      return of(42);
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    source.subscribe();
    source.subscribe();
    expect(subscriptions).to.equal(1);
  });

  it('should default to refCount being false', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-b-c-d-e-f-g-h-i-j');
      const sourceSubs = ' ^------------------';
      const sub1 = '       ^------!           ';
      const expected1 = '  a-b-c-d-           ';
      const sub2 = '       -----------^-------';
      const expected2 = '  -----------fg-h-i-j';

      const shared = source.pipe(shareReplay(1));

      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should not break lift() composability', (done) => {
    class MyCustomObservable<T> extends Observable<T> {
      lift<R>(operator: Operator<T, R>): Observable<R> {
        const observable = new MyCustomObservable<R>();
        (<any>observable).source = this;
        (<any>observable).operator = operator;
        return observable;
      }
    }

    const result = new MyCustomObservable((observer: Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(shareReplay());

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [1, 2, 3];

    result.subscribe({
      next(n: any) {
        expect(expected.length).to.be.greaterThan(0);
        expect(n).to.equal(expected.shift());
      },
      error() {
        done(new Error('should not be called'));
      },
      complete() {
        done();
      },
    });
  });

  it('should not skip values on a sync source', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const a = from(['a', 'b', 'c', 'd']);
      // We would like for the previous line to read like this:
      //
      // const a = cold('(abcd|)');
      //
      // However, that would synchronously emit multiple values at frame 0,
      // but it's not synchronous upon-subscription.
      // TODO: revisit once https://github.com/ReactiveX/rxjs/issues/5523 is fixed

      const x = cold('  x-------x');
      const expected = '(abcd)--d';

      const shared = a.pipe(shareReplay(1));
      const result = x.pipe(mergeMapTo(shared));
      expectObservable(result).toBe(expected);
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

    synchronousObservable.pipe(shareReplay({ refCount: true }), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  const FinalizationRegistry = (global as any).FinalizationRegistry;
  if (FinalizationRegistry && global.gc) {
    it('should not leak the subscriber for sync sources', (done) => {
      let callback: (() => void) | undefined = () => {
        /* noop */
      };

      const registry = new FinalizationRegistry((value: any) => {
        expect(value).to.equal('callback');
        done();
      });
      registry.register(callback, 'callback');

      const shared = of(42).pipe(shareReplay(1));
      shared.subscribe(callback);

      callback = undefined;
      global.gc?.();
    });
  } else {
    console.warn(`No support for FinalizationRegistry in Node ${process.version}`);
  }

  it('should be referentially-transparent', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source1 = cold('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = cold('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';

      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = pipe(shareReplay({ refCount: false }));

      // The non-referentially-transparent sharing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const shared1 = source1.pipe(partialPipeLine);
      const shared2 = source2.pipe(partialPipeLine);

      expectObservable(shared1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(shared2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);
    });
  });
});
