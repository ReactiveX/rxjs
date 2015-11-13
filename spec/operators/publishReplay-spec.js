/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.publishReplay()', function () {
  it('should return a ConnectableObservable', function () {
    var source = Observable.of(1).publishReplay();
    expect(source instanceof Rx.ConnectableObservable).toBe(true);
  });

  it('should mirror a simple source Observable', function () {
    var source = cold('--1-2---3-4--5-|');
    var sourceSubs =  '^              !';
    var published = source.publishReplay(1);
    var expected =    '--1-2---3-4--5-|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should do nothing if connect is not called, despite subscriptions', function () {
    var source = cold('--1-2---3-4--5-|');
    var sourceSubs = [];
    var published = source.publishReplay(1);
    var expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers, bufferSize=1', function () {
    var source =     cold('-1-2-3----4-|');
    var sourceSubs =      '^           !';
    var published = source.publishReplay(1);
    var subscriber1 = hot('a|           ').mergeMapTo(published);
    var expected1   =     '-1-2-3----4-|';
    var subscriber2 = hot('    b|       ').mergeMapTo(published);
    var expected2   =     '    23----4-|';
    var subscriber3 = hot('        c|   ').mergeMapTo(published);
    var expected3   =     '        3-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast the same values to multiple observers, bufferSize=2', function () {
    var source =     cold('-1-2-----3------4-|');
    var sourceSubs =      '^                 !';
    var published = source.publishReplay(2);
    var subscriber1 = hot('a|                 ').mergeMapTo(published);
    var expected1   =     '-1-2-----3------4-|';
    var subscriber2 = hot('    b|             ').mergeMapTo(published);
    var expected2   =     '    (12)-3------4-|';
    var subscriber3 = hot('           c|       ').mergeMapTo(published);
    var expected3   =     '           (23)-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast an error from the source to multiple observers', function () {
    var source =     cold('-1-2-3----4-#');
    var sourceSubs =      '^           !';
    var published = source.publishReplay(1);
    var subscriber1 = hot('a|           ').mergeMapTo(published);
    var expected1   =     '-1-2-3----4-#';
    var subscriber2 = hot('    b|       ').mergeMapTo(published);
    var expected2   =     '    23----4-#';
    var subscriber3 = hot('        c|   ').mergeMapTo(published);
    var expected3   =     '        3-4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast the same values to multiple observers, ' +
  'but is unsubscribed explicitly and early', function () {
    var source =     cold('-1-2-3----4-|');
    var sourceSubs =      '^        !   ';
    var published = source.publishReplay(1);
    var unsub =           '         u   ';
    var subscriber1 = hot('a|           ').mergeMapTo(published);
    var expected1   =     '-1-2-3----   ';
    var subscriber2 = hot('    b|       ').mergeMapTo(published);
    var expected2   =     '    23----   ';
    var subscriber3 = hot('        c|   ').mergeMapTo(published);
    var expected3   =     '        3-   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    var connection;
    expectObservable(hot(unsub).do(function () {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = published.connect();
  });

  describe('with refCount()', function () {
    it('should connect when first subscriber subscribes', function () {
      var source = cold(       '-1-2-3----4-|');
      var sourceSubs =      '   ^           !';
      var replayed = source.publishReplay(1).refCount();
      var subscriber1 = hot('   a|           ').mergeMapTo(replayed);
      var expected1 =       '   -1-2-3----4-|';
      var subscriber2 = hot('       b|       ').mergeMapTo(replayed);
      var expected2 =       '       23----4-|';
      var subscriber3 = hot('           c|   ').mergeMapTo(replayed);
      var expected3 =       '           3-4-|';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', function () {
      var source =     cold(   '-1-2-3----4-|');
      var sourceSubs =      '   ^        !   ';
      var replayed = source.publishReplay(1).refCount();
      var subscriber1 = hot('   a|           ').mergeMapTo(replayed);
      var unsub1 =          '          !     ';
      var expected1   =     '   -1-2-3--     ';
      var subscriber2 = hot('       b|       ').mergeMapTo(replayed);
      var unsub2 =          '            !   ';
      var expected2   =     '       23----   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be retryable', function () {
      var source =     cold('-1-2-3----4-#');
      var sourceSubs =      '^           !';
      var published = source.publishReplay(1).refCount().retry(3);
      var subscriber1 = hot('a|           ').mergeMapTo(published);
      var expected1   =     '-1-2-3----4-(444#)';
      var subscriber2 = hot('    b|       ').mergeMapTo(published);
      var expected2   =     '    23----4-(444#)';
      var subscriber3 = hot('        c|   ').mergeMapTo(published);
      var expected3   =     '        3-4-(444#)';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be repeatable', function () {
      var source =     cold('-1-2-3----4-|');
      var sourceSubs =      '^           !';
      var published = source.publishReplay(1).refCount().repeat(3);
      var subscriber1 = hot('a|           ').mergeMapTo(published);
      var expected1   =     '-1-2-3----4-(44|)';
      var subscriber2 = hot('    b|       ').mergeMapTo(published);
      var expected2   =     '    23----4-(44|)';
      var subscriber3 = hot('        c|   ').mergeMapTo(published);
      var expected3   =     '        3-4-(44|)';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast one observable to multiple observers', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    var connectable = source.publishReplay();

    connectable.subscribe(function (x) {
      results1.push(x);
    });
    connectable.subscribe(function (x) {
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

  it('should replay as many events as specified by the bufferSize', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    var connectable = source.publishReplay(2);

    connectable.subscribe(function (x) {
      results1.push(x);
    });

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    connectable.connect();

    connectable.subscribe(function (x) {
      results2.push(x);
    });

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results2).toEqual([3, 4]);
    expect(subscriptions).toBe(1);
    done();
  });

  it('should emit replayed values plus completed when subscribed after completed', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    var connectable = source.publishReplay(2);

    connectable.subscribe(function (x) {
      results1.push(x);
    });

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    connectable.connect();

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results2).toEqual([]);
    expect(subscriptions).toBe(1);

    connectable.subscribe(function (x) {
      results2.push(x);
    }, done.fail, function () {
      expect(results2).toEqual([3, 4]);
      done();
    });
  });

  it('should multicast an empty source', function () {
    var source = cold('|');
    var sourceSubs =  '(^!)';
    var published = source.publishReplay(1);
    var expected =    '|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a never source', function () {
    var source = cold('-');
    var sourceSubs =  '^';
    var published = source.publishReplay(1);
    var expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a throw source', function () {
    var source = cold('#');
    var sourceSubs =  '(^!)';
    var published = source.publishReplay(1);
    var expected =    '#';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should follow the RxJS 4 behavior and NOT allow you to reconnect by subscribing again', function (done) {
    var expected = [1, 2, 3, 4];
    var i = 0;

    var source = Observable.of(1, 2, 3, 4).publishReplay(1);

    var results = [];

    source.subscribe(
      function (x) {
        expect(x).toBe(expected[i++]);
      },
      null,
      function () {
        i = 0;

        source.subscribe(function (x) {
          results.push(x);
        }, null, done);

        source.connect();
      });

    source.connect();

    expect(results).toEqual([4]);
  });
});