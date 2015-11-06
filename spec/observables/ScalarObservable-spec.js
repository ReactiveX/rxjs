/* globals describe, it, expect, rxTestScheduler*/
var Rx = require('../../dist/cjs/Rx');
var ScalarObservable = require('../../dist/cjs/observables/ScalarObservable').ScalarObservable;
var EmptyObservable = require('../../dist/cjs/observables/EmptyObservable').EmptyObservable;
var ErrorObservable = require('../../dist/cjs/observables/ErrorObservable').ErrorObservable;
var Observable = Rx.Observable;

describe('ScalarObservable', function () {
  it('should create expose a value property', function () {
    var s = new ScalarObservable(1);
    expect(s.value).toBe(1);
  });

  it('should create ScalarObservable via staic create function', function () {
    var s = new ScalarObservable(1);
    var r = ScalarObservable.create(1);

    expect(s).toEqual(r);
  });

  it('should not schedule further if subscriber unsubscribed', function () {
    var s = new ScalarObservable(1, rxTestScheduler);
    var subscriber = new Rx.Subscriber();
    s.subscribe(subscriber);
    subscriber.isUnsubscribed = true;
    rxTestScheduler.flush();
  });

  describe('prototype.map()', function () {
    it('should map to a new ScalarObservable', function () {
      var s = new ScalarObservable(1);
      var r = s.map(function (x) { return x + '!!!'; });
      expect(r instanceof ScalarObservable).toBe(true);
      expect(r.value).toBe('1!!!');
    });

    it('should return an ErrorObservable if map errors', function () {
      var s = new ScalarObservable(1);
      var r = s.map(function (x) { throw 'bad!'; });
      expect(r instanceof ErrorObservable).toBe(true);
      expect(r.error).toBe('bad!');
    });
  });

  describe('prototype.count()', function () {
    it('should map to a new ScalarObservable of 1', function () {
      var s = new ScalarObservable(1);
      var r = s.count();
      expect(r instanceof ScalarObservable).toBe(true);
      expect(r.value).toBe(1);
    });

    it('should map to a new ScalarObservable of 1 if predicate matches', function () {
      var s = new ScalarObservable(1);
      var r = s.count(function (x) { return x === 1; });
      expect(r instanceof ScalarObservable).toBe(true);
      expect(r.value).toBe(1);
    });

    it('should map to a new ScalarObservable of 0 if predicate does not match', function () {
      var s = new ScalarObservable(1);
      var r = s.count(function (x) { return x === 0; });
      expect(r instanceof ScalarObservable).toBe(true);
      expect(r.value).toBe(0);
    });

    it('should map to a new ErrorObservable if predicate errors', function () {
      var s = new ScalarObservable(1);
      var r = s.count(function () { throw 'bad!'; });
      expect(r instanceof ErrorObservable).toBe(true);
      expect(r.error).toBe('bad!');
    });
  });

  describe('prototype.filter()', function () {
    it('should return itself if the filter matches its value', function () {
      var s = new ScalarObservable(1);
      var r = s.filter(function (x) { return x === 1; });
      expect(s).toBe(r);
    });

    it('should return EmptyObservable if filter does not match', function () {
      var s = new ScalarObservable(1);
      var r = s.filter(function (x) { return x === 0; });
      expect(r instanceof EmptyObservable).toBe(true);
    });

    it('should map to a new ErrorObservable if predicate errors', function () {
      var s = new ScalarObservable(1);
      var r = s.filter(function () { throw 'bad!'; });
      expect(r instanceof ErrorObservable).toBe(true);
      expect(r.error).toBe('bad!');
    });
  });

  describe('prototype.take()', function () {
    it('should return itself if count > 0', function () {
      var s = new ScalarObservable(1);
      var r = s.take(1);
      expect(s).toBe(r);
    });

    it('should return EmptyObservable if count === 0', function () {
      var s = new ScalarObservable(1);
      var r = s.take(0);
      expect(r instanceof EmptyObservable).toBe(true);
    });
  });

  describe('prototype.skip()', function () {
    it('should return itself if count === 0', function () {
      var s = new ScalarObservable(1);
      var r = s.skip(0);
      expect(s).toBe(r);
    });

    it('should return EmptyObservable if count > 0', function () {
      var s = new ScalarObservable(1);
      var r = s.skip(1);
      expect(r instanceof EmptyObservable).toBe(true);
    });
  });

  describe('prototype.reduce()', function () {
    it('should return a ScalarObservable of the result if there is a seed', function () {
      var s = new ScalarObservable(1);
      var r = s.reduce(function (a, x) { return a + x; }, 1);
      expect(r instanceof ScalarObservable).toBe(true);
      expect(r.value).toBe(2);
    });

    it('should return itself if there is no seed', function () {
      var s = new ScalarObservable(1);
      var r = s.reduce(function (a, x) { return a + x; });
      expect(r).toBe(s);
    });

    it('should return ErrorObservable if projection throws', function () {
      var s = new ScalarObservable(1);
      var r = s.reduce(function (a, x) { throw 'error'; }, 1);
      var expected = new ErrorObservable('error');

      expect(r).toEqual(expected);
    });
  });

  describe('prototype.scan()', function () {
    it('should return a ScalarObservable of the result if there is a seed', function () {
      var s = new ScalarObservable(1);
      var r = s.scan(function (a, x) { return a + x; }, 1);
      expect(r instanceof ScalarObservable).toBe(true);
      expect(r.value).toBe(2);
    });

    it('should return itself if there is no seed', function () {
      var s = new ScalarObservable(1);
      var r = s.scan(function (a, x) { return a + x; });
      expect(r).toBe(s);
    });

    it('should return ErrorObservable if projection throws', function () {
      var s = new ScalarObservable(1);
      var r = s.scan(function (a, x) { throw 'error'; }, 1);
      var expected = new ErrorObservable('error');

      expect(r).toEqual(expected);
    });
  });
});

// If you uncomment this, jasmine breaks? WEIRD
// describe('reality', function () {
//   it('should exist in this universe', function () {
//     expect(true).toBe(true);
//   });
// });