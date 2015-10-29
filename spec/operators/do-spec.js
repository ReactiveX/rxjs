/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.do()', function () {
  it('should next with a callback', function () {
    var value = null;
    Observable.of(42).do(function (x) {
      value = x;
    })
    .subscribe();

    expect(value).toBe(42);
  });

  it('should complete with a callback', function () {
    var err = null;
    Observable.throw('bad').do(null, function (x) {
      err = x;
    })
    .subscribe(null, function (ex) {
      expect(ex).toBe('bad');
    });

    expect(err).toBe('bad');
  });

  it('should handle everything with an observer', function () {
    var expected = [1,2,3];
    var results = [];
    var completeCalled = false;
    Observable.of(1,2,3)
      .do({
        next: function (x) {
          results.push(x);
        },
        error: function (err) {
          throw 'should not be called';
        },
        complete: function () {
          completeCalled = true;
        }
      })
      .subscribe();

    expect(completeCalled).toBe(true);
    expect(results).toEqual(expected);
  });

  it('should handle an error with a callback', function () {
    var errored = false;
    Observable.throw('bad').do(null, function (err) {
      expect(err).toBe('bad');
    })
    .subscribe(null, function (err) {
      errored = true;
      expect(err).toBe('bad');
    });

    expect(errored).toBe(true);
  });

  it('should handle an error with observer', function () {
    var errored = false;
    Observable.throw('bad').do({ error: function (err) {
      expect(err).toBe('bad');
    } })
    .subscribe(null, function (err) {
      errored = true;
      expect(err).toBe('bad');
    });

    expect(errored).toBe(true);
  });

  it('should handle complete with observer', function () {
    var completed = false;

    Observable.empty().do({
      complete: function () {
        completed = true;
      }
    }).subscribe();

    expect(completed).toBe(true);
  });

  it('should handle next with observer', function () {
    var value = null;

    Observable.of('hi').do({
      next: function (x) {
        value = x;
      }
    }).subscribe();

    expect(value).toBe('hi');
  });

  it('should raise error if next handler raises error', function () {
    Observable.of('hi').do({
      next: function (x) {
        throw new Error('bad');
      }
    }).subscribe(null, function (err) {
      expect(err.message).toBe('bad');
    });
  });

  it('should raise error if error handler raises error', function () {
    Observable.throw('ops').do({
      error: function (x) {
        throw new Error('bad');
      }
    }).subscribe(null, function (err) {
      expect(err.message).toBe('bad');
    });
  });

  it('should raise error if complete handler raises error', function () {
    Observable.empty().do({
      complete: function (x) {
        throw new Error('bad');
      }
    }).subscribe(null, function (err) {
      expect(err.message).toBe('bad');
    });
  });
});
