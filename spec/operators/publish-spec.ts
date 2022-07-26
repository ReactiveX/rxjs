import { expect } from 'chai';
import { publish, zip, mergeMapTo, mergeMap, tap, refCount, retry, repeat } from 'rxjs/operators';
import { ConnectableObservable, of, Subscription, Observable, pipe } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {publish} */
describe('publish operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should mirror a simple source Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const published = source.pipe(publish()) as ConnectableObservable<any>;
      const expected = '   --1-2---3-4--5-|';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should return a ConnectableObservable-ish', () => {
    const source = of(1).pipe(publish()) as ConnectableObservable<number>;
    expect(typeof (<any>source)._subscribe === 'function').to.be.true;
    expect(typeof (<any>source).getSubject === 'function').to.be.true;
    expect(typeof source.connect === 'function').to.be.true;
    expect(typeof source.refCount === 'function').to.be.true;
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs: string[] = [];
      const published = source.pipe(publish());
      const expected = '   -               ';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast the same values to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('   -1-2-3----4-|');
      const sourceSubs = '    ^-----------!';
      const published = source.pipe(publish()) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      -----3----4-|';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      ----------4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should accept selectors', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('     -1-2-3----4-|');
      const sourceSubs = [
        '                      ^-----------!',
        '                      ----^-------!',
        '                      --------^---!',
      ];
      const published = source.pipe(publish((x) => x.pipe(zip(x, (a, b) => (parseInt(a) + parseInt(b)).toString()))));
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      -2-4-6----8-|';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      -----6----8-|';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      ----------8-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast an error from the source to multiple observers', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const published = source.pipe(publish()) as ConnectableObservable<string>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      -----3----4-#';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      ----------4-#';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast the same values to multiple observers, but is unsubscribed explicitly and early', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const published = source.pipe(publish()) as ConnectableObservable<string>;
      const unsub = '          ---------u   ';
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      ----------   ';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      // Set up unsubscription action
      let connection: Subscription;
      expectObservable(
        hot(unsub).pipe(
          tap(() => {
            connection.unsubscribe();
          })
        )
      ).toBe(unsub);

      connection = published.connect();
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^--------!   ';
      const published = source.pipe(
        mergeMap((x) => of(x)),
        publish()
      ) as ConnectableObservable<any>;
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1 = '      -1-2-3----   ';
      const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
      const expected2 = '      -----3----   ';
      const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
      const expected3 = '      ----------   ';
      const unsub = '          ---------u   ';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      // Set up unsubscription action
      let connection: Subscription;
      expectObservable(
        hot(unsub).pipe(
          tap(() => {
            connection.unsubscribe();
          })
        )
      ).toBe(unsub);

      connection = published.connect();
    });
  });

  describe('with refCount()', () => {
    it('should connect when first subscriber subscribes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^-----------!';
        const replayed = source.pipe(publish(), refCount());
        const subscriber1 = hot('---a|           ').pipe(mergeMapTo(replayed));
        const expected1 = '      ----1-2-3----4-|';
        const subscriber2 = hot('-------b|       ').pipe(mergeMapTo(replayed));
        const expected2 = '      --------3----4-|';
        const subscriber3 = hot('-----------c|   ').pipe(mergeMapTo(replayed));
        const expected3 = '      -------------4-|';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('       -1-2-3----4-|');
        const sourceSubs = '     ---^--------!   ';
        const replayed = source.pipe(publish(), refCount());
        const subscriber1 = hot('---a|           ').pipe(mergeMapTo(replayed));
        const unsub1 = '         ----------!     ';
        const expected1 = '      ----1-2-3--     ';
        const subscriber2 = hot('-------b|       ').pipe(mergeMapTo(replayed));
        const unsub2 = '         ------------!   ';
        const expected2 = '      --------3----   ';

        expectObservable(subscriber1, unsub1).toBe(expected1);
        expectObservable(subscriber2, unsub2).toBe(expected2);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should NOT be retryable', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('   -1-2-3----4-#');
        const sourceSubs = '    ^-----------!';
        const published = source.pipe(publish(), refCount(), retry(3));
        const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
        const expected1 = '      -1-2-3----4-#';
        const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
        const expected2 = '      -----3----4-#';
        const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
        const expected3 = '      ----------4-#';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });

    it('should NOT be repeatable', () => {
      testScheduler.run(({ cold, hot, expectObservable, expectSubscriptions }) => {
        const source = cold('    -1-2-3----4-|');
        const sourceSubs = '     ^-----------!';
        const published = source.pipe(publish(), refCount(), repeat(3));
        const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
        const expected1 = '      -1-2-3----4-|';
        const subscriber2 = hot('----b|       ').pipe(mergeMapTo(published));
        const expected2 = '      -----3----4-|';
        const subscriber3 = hot('--------c|   ').pipe(mergeMapTo(published));
        const expected3 = '      ----------4-|';

        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      });
    });
  });

  it('should emit completed when subscribed after completed', (done) => {
    const results1: number[] = [];
    const results2: number[] = [];
    let subscriptions = 0;

    const source = new Observable<number>((observer) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.pipe(publish()) as ConnectableObservable<number>;

    connectable.subscribe((x) => {
      results1.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([]);
    expect(subscriptions).to.equal(1);

    connectable.subscribe({
      next: (x) => {
        results2.push(x);
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        expect(results2).to.deep.equal([]);
        done();
      },
    });
  });

  it('should multicast an empty source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const sourceSubs = ' (^!)';
      const published = source.pipe(publish()) as ConnectableObservable<string>;
      const expected = '   |   ';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast a never source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const sourceSubs = ' ^';
      const published = source.pipe(publish()) as ConnectableObservable<string>;
      const expected = '   -';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast a throw source', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#   ');
      const sourceSubs = ' (^!)';
      const published = source.pipe(publish()) as ConnectableObservable<string>;
      const expected = '   #   ';

      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      published.connect();
    });
  });

  it('should multicast one observable to multiple observers', (done) => {
    const results1: number[] = [];
    const results2: number[] = [];
    let subscriptions = 0;

    const source = new Observable<number>((observer) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.pipe(publish()) as ConnectableObservable<number>;

    connectable.subscribe((x) => {
      results1.push(x);
    });

    connectable.subscribe((x) => {
      results2.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([1, 2, 3, 4]);
    expect(subscriptions).to.equal(1);
    done();
  });

  it('should be referentially-transparent', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source1 = cold('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = cold('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';

      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = pipe(publish());

      // The non-referentially-transparent publishing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const published1 = source1.pipe(partialPipeLine) as ConnectableObservable<any>;
      const published2 = source2.pipe(partialPipeLine) as ConnectableObservable<any>;

      expectObservable(published1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(published2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);

      published1.connect();
      published2.connect();
    });
  });
});
