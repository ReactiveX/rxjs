/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var TestScheduler = Rx.TestScheduler;
var Notification = Rx.Notification;

describe('TestScheduler', function() {
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
    });
    
    describe('hot()', function () {
      it('should exist', function () {
        expect(typeof hot).toBe('function');
      });
    });
    
    describe('expectObservable()', function () {
      it('should exist', function () {
        expect(typeof expectObservable).toBe('function');
      });
    });
    
    describe('end-to-end helper tests', function () {
      it('should be awesome', function () {
        var values = { a: 1, b: 2 };
        var myObservable = cold('---a---b--|', values);
        expectObservable(myObservable).toBe('---a---b--|', values);
      });
    });
  });
});