import * as Rx from '../../dist/cjs/Rx';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, DoneSignature, asDiagram} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.prototype.publish()', () => {
  asDiagram('publish')('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const published = source.publish();
    const expected =    '--1-2---3-4--5-|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('To match RxJS 4 behavior, it should NOT allow you to reconnect by subscribing again', (done: DoneSignature) => {
    const expected = [1, 2, 3, 4];
    let i = 0;

    const source = Observable.of(1, 2, 3, 4).publish();

    source.subscribe((x: number) => {
      expect(x).toBe(expected[i++]);
    },
    done.fail,
    () => {
      source.subscribe((x: any) => {
        done.fail('should not be called');
      }, done.fail, done);

      source.connect();
    });

    source.connect();
  });

  it('should return a ConnectableObservable', () => {
    const source = Observable.of(1).publish();
    expect(source instanceof Rx.ConnectableObservable).toBe(true);
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs = [];
    const published = source.publish();
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^           !';
    const published = source.publish();
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    -3----4-|';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        --4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#');
    const sourceSubs =      '^           !';
    const published = source.publish();
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    -3----4-#';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        --4-#';

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
    const published = source.publish();
    const unsub =           '         u   ';
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        --   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection;
    expectObservable(hot(unsub).do(() => {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = published.connect();
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const published = source
      .mergeMap((x: any) => Observable.of(x))
      .publish();
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '-1-2-3----   ';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    -3----   ';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        --   ';
    const unsub =           '         u   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection;
    expectObservable(hot(unsub).do(() => {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = published.connect();
  });

  describe('with refCount()', () => {
    it('should connect when first subscriber subscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^           !';
      const replayed = source.publish().refCount();
      const subscriber1 = hot('   a|           ').mergeMapTo(replayed);
      const expected1   =     '   -1-2-3----4-|';
      const subscriber2 = hot('       b|       ').mergeMapTo(replayed);
      const expected2   =     '       -3----4-|';
      const subscriber3 = hot('           c|   ').mergeMapTo(replayed);
      const expected3   =     '           --4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const replayed = source.publish().refCount();
      const subscriber1 = hot('   a|           ').mergeMapTo(replayed);
      const unsub1 =          '          !     ';
      const expected1   =     '   -1-2-3--     ';
      const subscriber2 = hot('       b|       ').mergeMapTo(replayed);
      const unsub2 =          '            !   ';
      const expected2   =     '       -3----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be retryable', () => {
      const source =     cold('-1-2-3----4-#');
      const sourceSubs =      '^           !';
      const published = source.publish().refCount().retry(3);
      const subscriber1 = hot('a|           ').mergeMapTo(published);
      const expected1   =     '-1-2-3----4-#';
      const subscriber2 = hot('    b|       ').mergeMapTo(published);
      const expected2   =     '    -3----4-#';
      const subscriber3 = hot('        c|   ').mergeMapTo(published);
      const expected3   =     '        --4-#';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be repeatable', () => {
      const source =     cold('-1-2-3----4-|');
      const sourceSubs =      '^           !';
      const published = source.publish().refCount().repeat(3);
      const subscriber1 = hot('a|           ').mergeMapTo(published);
      const expected1   =     '-1-2-3----4-|';
      const subscriber2 = hot('    b|       ').mergeMapTo(published);
      const expected2   =     '    -3----4-|';
      const subscriber3 = hot('        c|   ').mergeMapTo(published);
      const expected3   =     '        --4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should emit completed when subscribed after completed', (done: DoneSignature) => {
    const results1 = [];
    const results2 = [];
    let subscriptions = 0;

    const source = new Observable((observer: Rx.Observer<number>) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.publish();

    connectable.subscribe((x: any) => {
      results1.push(x);
    });

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    connectable.connect();

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results2).toEqual([]);
    expect(subscriptions).toBe(1);

    connectable.subscribe((x: any) => {
      results2.push(x);
    }, done.fail, () => {
      expect(results2).toEqual([]);
      done();
    });
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const published = source.publish();
    const expected =    '|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const published = source.publish();
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const published = source.publish();
    const expected =    '#';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast one observable to multiple observers', (done: DoneSignature) => {
    const results1 = [];
    const results2 = [];
    let subscriptions = 0;

    const source = new Observable((observer: Rx.Observer<number>) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.publish();

    connectable.subscribe((x: any) => {
      results1.push(x);
    });

    connectable.subscribe((x: any) => {
      results2.push(x);
    });

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    connectable.connect();

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results2).toEqual([1, 2, 3, 4]);
    expect(subscriptions).toBe(1);
    done();
  });
});