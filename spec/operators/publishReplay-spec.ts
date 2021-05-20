import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { throwError, ConnectableObservable, EMPTY, NEVER, of, Observable, Subscription, pipe } from 'rxjs';
import { publishReplay, mergeMapTo, tap, mergeMap, refCount, retry, repeat, map } from 'rxjs/operators';

/** @test {publishReplay} */
describe('publishReplay operator', () => {
  it('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const expected =    '--1-2---3-4--5-|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should return a ConnectableObservable-ish', () => {
    const source = of(1).pipe(publishReplay()) as ConnectableObservable<number>;
    expect(typeof (<any> source)._subscribe === 'function').to.be.true;
    expect(typeof (<any> source).getSubject === 'function').to.be.true;
    expect(typeof source.connect === 'function').to.be.true;
    expect(typeof source.refCount === 'function').to.be.true;
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs: string[] = [];
    const published = source.pipe(publishReplay(1));
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers, bufferSize=1', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^           !';
    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(published));
    const expected2   =     '    23----4-|';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(published));
    const expected3   =     '        3-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast the same values to multiple observers, bufferSize=2', () => {
    const source =     cold('-1-2-----3------4-|');
    const sourceSubs =      '^                 !';
    const published = source.pipe(publishReplay(2)) as ConnectableObservable<string>;
    const subscriber1 = hot('a|                 ').pipe(mergeMapTo(published));
    const expected1   =     '-1-2-----3------4-|';
    const subscriber2 = hot('    b|             ').pipe(mergeMapTo(published));
    const expected2   =     '    (12)-3------4-|';
    const subscriber3 = hot('           c|       ').pipe(mergeMapTo(published));
    const expected3   =     '           (23)-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#');
    const sourceSubs =      '^           !';
    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(published));
    const expected2   =     '    23----4-#';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(published));
    const expected3   =     '        3-4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast the same values to multiple observers, ' +
  'but is unsubscribed explicitly and early', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const unsub =           '         u   ';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(published));
    const expected2   =     '    23----   ';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(published));
    const expected3   =     '        3-   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection: Subscription;
    expectObservable(hot(unsub).pipe(tap(() => {
      connection.unsubscribe();
    }))).toBe(unsub);

    connection = published.connect();
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const published = source.pipe(
      mergeMap((x) => of(x)),
      publishReplay(1)
    ) as ConnectableObservable<string>;
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(published));
    const expected2   =     '    23----   ';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(published));
    const expected3   =     '        3-   ';
    const unsub =           '         u   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection: Subscription;
    expectObservable(hot(unsub).pipe(tap(() => {
      connection.unsubscribe();
    }))).toBe(unsub);

    connection = published.connect();
  });

  describe('with refCount()', () => {
    it('should connect when first subscriber subscribes', () => {
      const source = cold(       '-1-2-3----4-|');
      const sourceSubs =      '   ^           !';
      const replayed = source.pipe(
        publishReplay(1),
        refCount()
      );
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(replayed));
      const expected1 =       '   -1-2-3----4-|';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(replayed));
      const expected2 =       '       23----4-|';
      const subscriber3 = hot('           c|   ').pipe(mergeMapTo(replayed));
      const expected3 =       '           3-4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const replayed = source.pipe(
        publishReplay(1),
        refCount()
      );
      const subscriber1 = hot('   a|           ').pipe(mergeMapTo(replayed));
      const unsub1 =          '          !     ';
      const expected1   =     '   -1-2-3--     ';
      const subscriber2 = hot('       b|       ').pipe(mergeMapTo(replayed));
      const unsub2 =          '            !   ';
      const expected2   =     '       23----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be retryable', () => {
      const source =     cold('-1-2-3----4-#');
      // const sourceSubs =      '^           !';
      const published = source.pipe(
        publishReplay(1),
        refCount(),
        retry(3)
      );
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1   =     '-1-2-3----4-(444#)';
      const subscriber2 = hot('    b|       ').pipe(mergeMapTo(published));
      const expected2   =     '    23----4-(444#)';
      const subscriber3 = hot('        c|   ').pipe(mergeMapTo(published));
      const expected3   =     '        3-4-(444#)';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      // expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be repeatable', () => {
      const source =     cold('-1-2-3----4-|');
      // const sourceSubs =      '^           !';
      const published = source.pipe(
        publishReplay(1),
        refCount(),
        repeat(3)
      );
      const subscriber1 = hot('a|           ').pipe(mergeMapTo(published));
      const expected1   =     '-1-2-3----4-(44|)';
      const subscriber2 = hot('    b|       ').pipe(mergeMapTo(published));
      const expected2   =     '    23----4-(44|)';
      const subscriber3 = hot('        c|   ').pipe(mergeMapTo(published));
      const expected3   =     '        3-4-(44|)';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      // expectSubscriptions(source.subscriptions).toBe(sourceSubs);
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

    const connectable = source.pipe(publishReplay()) as ConnectableObservable<number>;

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

  it('should replay as many events as specified by the bufferSize', (done) => {
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

    const connectable = source.pipe(publishReplay(2)) as ConnectableObservable<number>;

    connectable.subscribe((x) => {
      results1.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    connectable.subscribe((x) => {
      results2.push(x);
    });

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([3, 4]);
    expect(subscriptions).to.equal(1);
    done();
  });

  it('should emit replayed values and resubscribe to the source when ' +
    'reconnected without source completion', () => {
    const results1: number[] = [];
    const results2: number[] = [];
    let subscriptions = 0;

    const source = new Observable<number>((observer) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      // observer.complete();
    });

    const connectable = source.pipe(publishReplay(2)) as ConnectableObservable<number>;
    const subscription1 = connectable.subscribe((x) => {
      results1.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect().unsubscribe();
    subscription1.unsubscribe();

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([]);
    expect(subscriptions).to.equal(1);

    const subscription2 = connectable.subscribe((x) => {
      results2.push(x);
    });

    connectable.connect().unsubscribe();
    subscription2.unsubscribe();

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([3, 4, 1, 2, 3, 4]);
    expect(subscriptions).to.equal(2);
  });

  it('should emit replayed values plus completed when subscribed after completed', (done) => {
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

    const connectable = source.pipe(publishReplay(2)) as ConnectableObservable<number>;

    connectable.subscribe((x) => {
      results1.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    expect(results1).to.deep.equal([1, 2, 3, 4]);
    expect(results2).to.deep.equal([]);
    expect(subscriptions).to.equal(1);

    connectable.subscribe((x) => {
      results2.push(x);
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      expect(results2).to.deep.equal([3, 4]);
      done();
    });
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const expected =    '|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';

    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const published = source.pipe(publishReplay(1)) as ConnectableObservable<string>;
    const expected =    '#';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should mirror a simple source Observable with selector', () => {
    const values = {a: 2, b: 4, c: 6, d: 8};
    const selector = (observable: Observable<string>) => observable.pipe(map(v => 2 * +v));
    const source = cold('--1-2---3-4---|');
    const sourceSubs =  '^             !';
    const published = source.pipe(publishReplay(1, Infinity, selector));
    const expected =    '--a-b---c-d---|';

    expectObservable(published).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should EMIT an error when the selector throws an exception', () => {
    const error = "It's broken";
    const selector = () => {
      throw error;
    };
    const source = cold('--1-2---3-4---|');
    const published = source.pipe(publishReplay(1, Infinity, selector));

    expectObservable(published).toBe('#', undefined, "It's broken");
  });

  it('should emit an error when the selector returns an Observable that emits an error', () => {
    const error = "It's broken";
    const innerObservable = cold('--5-6----#', undefined, error);
    const selector = (observable: Observable<string>) => observable.pipe(mergeMapTo(innerObservable));
    const source = cold('--1--2---3---|');
    const sourceSubs =  '^          !';
    const published = source.pipe(publishReplay(1, Infinity, selector));
    const expected =    '----5-65-6-#';

    expectObservable(published).toBe(expected, undefined, error);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should terminate immediately when the selector returns an empty Observable', () => {
    const selector = () => EMPTY;
    const source = cold('--1--2---3---|');
    const sourceSubs =  '(^!)';
    const published = source.pipe(publishReplay(1, Infinity, selector));
    const expected =    '|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not emit and should not complete/error when the selector returns never', () => {
    const selector = () => NEVER;
    const source = cold('-');
    const sourceSubs =  '^';
    const published = source.pipe(publishReplay(1, Infinity, selector));
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit error when the selector returns Observable.throw', () => {
    const error = "It's broken";
    const selector = () => throwError(() => (error));
    const source = cold('--1--2---3---|');
    const sourceSubs =  '(^!)';
    const published = source.pipe(publishReplay(1, Infinity, selector));
    const expected =    '#';

    expectObservable(published).toBe(expected, undefined, error);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be referentially-transparent', () => {
    const source1 = cold('-1-2-3-4-5-|');
    const source1Subs =  '^          !';
    const expected1 =    '-1-2-3-4-5-|';
    const source2 = cold('-6-7-8-9-0-|');
    const source2Subs =  '^          !';
    const expected2 =    '-6-7-8-9-0-|';

    // Calls to the _operator_ must be referentially-transparent.
    const partialPipeLine = pipe(
      publishReplay(1)
    );

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
