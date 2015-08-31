/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.retryWhen()', function () {
  it('should retry when notified via returned notifier on thrown error', function (done) {
    var retried = false;
    var expected = [1, 2, 1, 2];
    var i = 0;
    Observable.of(1, 2, 3)
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .retryWhen(function (errors) {
        return errors.map(function (x) {
          expect(x).toBe('bad');
          if (retried) {
            throw 'done';
          }
          retried = true;
          return x;
        });
      })
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      },
      function (err) {
        expect(err).toBe('done');
        done();
      })
  });
  
  it('should retry when notified and complete on returned completion', function (done) {
    var expected = [1, 2, 1, 2];
    Observable.of(1, 2, 3)
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .retryWhen(function (errors) {
        return Observable.empty();
      })
      .subscribe(function (n) {
        expect(n).toBe(expected.shift());
      }, function (err) {
        throw 'error should not be called';
      }, done);
  });
});