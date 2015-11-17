/* globals describe, it, expect, rxTestScheduler*/
var Rx = require('../../dist/cjs/Rx');
var IteratorObservable = require('../../dist/cjs/observables/IteratorObservable').IteratorObservable;
var Observable = Rx.Observable;

describe('IteratorObservable', function () {
  it('should create an Observable via constructor', function () {
    var source = new IteratorObservable([]);
    expect(source instanceof IteratorObservable).toBe(true);
  });

  it('should create IteratorObservable via static create function', function () {
    var s = new IteratorObservable([]);
    var r = IteratorObservable.create([]);
    expect(s).toEqual(r);
  });

  it('should not accept null (or truthy-equivalent to null) iterator', function () {
    expect(function () {
      IteratorObservable.create(null);
    }).toThrowError('iterator cannot be null.');
    expect(function () {
      IteratorObservable.create(void 0);
    }).toThrowError('iterator cannot be null.');
  });

  it('should not accept boolean as iterator', function () {
    expect(function () {
      IteratorObservable.create(false);
    }).toThrowError('Object is not iterable');
  });

  it('should not accept non-function project', function () {
    expect(function () {
      IteratorObservable.create([], 42);
    }).toThrowError('When provided, `project` must be a function.');
  });

  it('should emit members of an array iterator', function (done) {
    var expected = [10, 20, 30, 40];
    IteratorObservable.create([10, 20, 30, 40])
      .subscribe(
        function (x) { expect(x).toBe(expected.shift()); },
        done.fail,
        function () {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should emit members of an array iterator on a particular scheduler', function () {
    var source = IteratorObservable.create(
      [10, 20, 30, 40],
      function (x) { return x; },
      null,
      rxTestScheduler
    );

    var values = { a: 10, b: 20, c: 30, d: 40 };

    expectObservable(source).toBe('(abcd|)', values);
  });

  it('should emit members of an array iterator on a particular scheduler, project throws', function () {
    var source = IteratorObservable.create(
      [10, 20, 30, 40],
      function (x) {
        if (x === 30) {
          throw 'error';
        }
        return x * x;
      },
      null,
      rxTestScheduler
    );

    var values = { a: 100, b: 400 };

    expectObservable(source).toBe('(ab#)', values);
  });

  it('should emit members of an array iterator on a particular scheduler, ' +
  'but is unsubscribed early', function (done) {
    var expected = [10, 20, 30, 40];

    var source = IteratorObservable.create(
      [10, 20, 30, 40],
      function (x) { return x; },
      null,
      Rx.Scheduler.immediate
    );

    var subscriber = Rx.Subscriber.create(
      function (x) {
        expect(x).toBe(expected.shift());
        if (x === 30) {
          subscriber.unsubscribe();
          done();
        }
      },
      done.fail,
      done.fail
    );

    source.subscribe(subscriber);
  });

  it('should emit members of an array iterator, and project them', function (done) {
    var expected = [100, 400, 900, 1600];
    IteratorObservable.create([10, 20, 30, 40], function (x) { return x * x; })
      .subscribe(
        function (x) { expect(x).toBe(expected.shift()); },
        done.fail,
        function () {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should emit members of an array iterator, and project but raise an error', function (done) {
    var expected = [100, 400];
    function project(x) {
      if (x === 30) {
        throw new Error('boom');
      } else {
        return x * x;
      }
    }
    IteratorObservable.create([10, 20, 30, 40], project)
      .subscribe(
        function (x) {
          expect(x).toBe(expected.shift());
        },
        function (err) {
          expect(expected.length).toBe(0);
          expect(err.message).toBe('boom');
          done();
        },
        done.fail
      );
  });

  it('should emit characters of a string iterator', function (done) {
    var expected = ['f', 'o', 'o'];
    IteratorObservable.create('foo')
      .subscribe(
        function (x) { expect(x).toBe(expected.shift()); },
        done.fail,
        function () {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should emit characters of a string iterator, and project them', function (done) {
    var expected = ['F', 'O', 'O'];
    IteratorObservable.create('foo', function (x) { return x.toUpperCase(); })
      .subscribe(
        function (x) { expect(x).toBe(expected.shift()); },
        done.fail,
        function () {
          expect(expected.length).toBe(0);
          done();
        }
      );
  });

  it('should be possible to unsubscribe in the middle of the iteration', function (done) {
    var expected = [10, 20, 30];

    var subscriber = Rx.Subscriber.create(
      function (x) {
        expect(x).toBe(expected.shift());
        if (x === 30) {
          subscriber.unsubscribe();
          done();
        }
      },
      done.fail,
      done.fail
    );

    IteratorObservable.create([10, 20, 30, 40, 50, 60]).subscribe(subscriber);
  });
});
