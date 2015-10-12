/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var TestScheduler = Rx.TestScheduler;
var Notification = Rx.Notification;

describe('TestScheduler', function () {
  it('should exist', function () {
    expect(typeof TestScheduler).toBe('function');
  });

  describe('parseMarbles()', function () {
    it('should parse a marble string into a series of notifications and types', function () {
      var result = TestScheduler.parseMarbles('-------a---b---|', { a: 'A', b: 'B' });
      expect(result).toDeepEqual([
        { frame: 70, notification: Notification.createNext('A') },
        { frame: 110, notification: Notification.createNext('B') },
        { frame: 150, notification: Notification.createComplete() }
      ]);
    });

    it('should parse a marble string, allowing spaces too', function () {
      var result = TestScheduler.parseMarbles('--a--b--|   ', { a: 'A', b: 'B' });
      expect(result).toDeepEqual([
        { frame: 20, notification: Notification.createNext('A') },
        { frame: 50, notification: Notification.createNext('B') },
        { frame: 80, notification: Notification.createComplete() }
      ]);
    });

    it('should parse a marble string with a subscription point', function () {
      var result = TestScheduler.parseMarbles('---^---a---b---|', { a: 'A', b: 'B' });
      expect(result).toDeepEqual([
        { frame: 40, notification: Notification.createNext('A') },
        { frame: 80, notification: Notification.createNext('B') },
        { frame: 120, notification: Notification.createComplete() }
      ]);
    });

    it('should parse a marble string with an error', function () {
      var result = TestScheduler.parseMarbles('-------a---b---#', { a: 'A', b: 'B' }, 'omg error!');
      expect(result).toDeepEqual([
        { frame: 70, notification: Notification.createNext('A') },
        { frame: 110, notification: Notification.createNext('B') },
        { frame: 150, notification: Notification.createError('omg error!') }
      ]);
    });

    it('should default in the letter for the value if no value hash was passed', function () {
      var result = TestScheduler.parseMarbles('--a--b--c--');
      expect(result).toDeepEqual([
        { frame: 20, notification: Notification.createNext('a') },
        { frame: 50, notification: Notification.createNext('b') },
        { frame: 80, notification: Notification.createNext('c') },
      ]);
    });

    it('should handle grouped values', function () {
      var result = TestScheduler.parseMarbles('---(abc)---');
      expect(result).toDeepEqual([
        { frame: 30, notification: Notification.createNext('a') },
        { frame: 30, notification: Notification.createNext('b') },
        { frame: 30, notification: Notification.createNext('c') }
      ]);
    });
  });

  describe('parseMarblesAsSubscriptions()', function () {
    it('should parse a subscription marble string into a subscriptionLog', function () {
      var result = TestScheduler.parseMarblesAsSubscriptions('---^---!-');
      expect(result.subscribedFrame).toEqual(30);
      expect(result.unsubscribedFrame).toEqual(70);
    });

    it('should parse a subscription marble string with an unsubscription', function () {
      var result = TestScheduler.parseMarblesAsSubscriptions('---^-');
      expect(result.subscribedFrame).toEqual(30);
      expect(result.unsubscribedFrame).toEqual(Number.POSITIVE_INFINITY);
    });

    it('should parse a subscription marble string with a synchronous unsubscription', function () {
      var result = TestScheduler.parseMarblesAsSubscriptions('---(^!)-');
      expect(result.subscribedFrame).toEqual(30);
      expect(result.unsubscribedFrame).toEqual(30);
    });
  });

  describe('createColdObservable()', function () {
    it('should create a cold observable', function () {
      var expected = ['A', 'B'];
      var scheduler = new TestScheduler();
      var source = scheduler.createColdObservable('--a---b--|', { a: 'A', b: 'B' });
      expect(source instanceof Rx.Observable).toBe(true);
      source.subscribe(function (x) {
        expect(x).toBe(expected.shift());
      });
      scheduler.flush();
      expect(expected.length).toBe(0);
    });
  });

  describe('createHotObservable()', function () {
    it('should create a cold observable', function () {
      var expected = ['A', 'B'];
      var scheduler = new TestScheduler();
      var source = scheduler.createHotObservable('--a---b--|', { a: 'A', b: 'B' });
      expect(source instanceof Rx.Subject).toBe(true);
      source.subscribe(function (x) {
        expect(x).toBe(expected.shift());
      });
      scheduler.flush();
      expect(expected.length).toBe(0);
    });
  });

  describe('jasmine helpers', function () {
    describe('rxTestScheduler', function () {
      it('should exist', function () {
        expect(rxTestScheduler instanceof Rx.TestScheduler).toBe(true);
      });
    });

    describe('cold()', function () {
      it('should exist', function () {
        expect(typeof cold).toBe('function');
      });

      it('should create a cold observable', function () {
        var expected = [1, 2];
        var source = cold('-a-b-|', { a: 1, b: 2 });
        source.subscribe(function (x) {
          expect(x).toBe(expected.shift());
        }, null, function () {
          expect(expected.length).toBe(0);
        });
        expectObservable(source).toBe('-a-b-|', { a: 1, b: 2 });
      });
    });

    describe('hot()', function () {
      it('should exist', function () {
        expect(typeof hot).toBe('function');
      });

      it('should create a hot observable', function () {
        var source = hot('---^-a-b-|', { a: 1, b: 2 });
        expect(source instanceof Rx.Subject).toBe(true);
        expectObservable(source).toBe('--a-b-|', { a: 1, b: 2 });
      });
    });

    describe('expectObservable()', function () {
      it('should exist', function () {
        expect(typeof expectObservable).toBe('function');
      });

      it('should return an object with a toBe function', function () {
        expect(typeof (expectObservable(Rx.Observable.of(1)).toBe)).toBe('function');
      });

      it('should append to flushTests array', function () {
        expectObservable(Rx.Observable.empty());
        expect(rxTestScheduler.flushTests.length).toBe(1);
      });

      it('should handle empty', function () {
        expectObservable(Rx.Observable.empty()).toBe('|', {});
      });

      it('should handle never', function () {
        expectObservable(Rx.Observable.never()).toBe('-', {});
        expectObservable(Rx.Observable.never()).toBe('---', {});
      });

      it('should accept an unsubscription marble diagram', function () {
        var source = hot('---^-a-b-|');
        var unsubscribe  =  '---!';
        var expected =      '--a';
        expectObservable(source, unsubscribe).toBe(expected);
      });
    });

    describe('expectSubscriptions()', function () {
      it('should exist', function () {
        expect(typeof expectSubscriptions).toBe('function');
      });

      it('should return an object with a toBe function', function () {
        expect(typeof (expectSubscriptions([]).toBe)).toBe('function');
      });

      it('should append to flushTests array', function () {
        expectSubscriptions([]);
        expect(rxTestScheduler.flushTests.length).toBe(1);
      });

      it('should assert subscriptions of a cold observable', function () {
        var source = cold('---a---b-|');
        var subs =        '^--------!';
        expectSubscriptions(source.subscriptions).toBe(subs);
        source.subscribe();
      });
    });

    describe('end-to-end helper tests', function () {
      it('should be awesome', function () {
        var values = { a: 1, b: 2 };
        var myObservable = cold('---a---b--|', values);
        var subs =              '^---------!';
        expectObservable(myObservable).toBe('---a---b--|', values);
        expectSubscriptions(myObservable.subscriptions).toBe(subs);
      });

      it('should support testing metastreams', function () {
        var x = cold('-a-b|');
        var y = cold('-c-d|');
        var myObservable = hot('---x---y----|', { x: x, y: y });
        var expected =         '---x---y----|';
        var expectedx = cold('-a-b|');
        var expectedy = cold('-c-d|');
        expectObservable(myObservable).toBe(expected, { x: expectedx, y: expectedy });
      });
    });
  });
});
