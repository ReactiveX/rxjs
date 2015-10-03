/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.catch()', function () {
  it('should pass the error as the first argument', function (done) {
    Observable.throw('bad')
      .catch(function (err) {
        expect(err).toBe('bad');
        return Observable.empty();
      })
      .subscribe(function () { },
        function (err) {
          expect('this was called').not.toBeTruthy();
        },
        done);
  });
  
  it('should catch the error and allow the return of a new observable to use', function (done) {
    var expected = [1, 2, 'foo'];
    Observable.create(function(observer) {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .catch(function (err) {
        return Observable.of('foo');
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, function (err) {
        expect('this was called').not.toBeTruthy();
      }, function () {
        done();
      });
  });
  
  it('should catch and allow the observable to be repeated with the third (caught) argument', function (done) {
    var expected = [1, 2, 1, 2, 1, 2];
    var retries = 0;
    Observable.create(function(observer) {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .catch(function (err, caught) {
        if (retries++ == 2) {
          throw 'done';
        }
        return caught;
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, function (err) {
        expect(err).toBe('done');
        done();
      }, function () {
        expect('this was called').not.toBeTruthy();
      })
  });
  
  it('should complete if you return Observable.empty()', function (done) {
    var expected = [1, 2];
    Observable.create(function(observer) {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .catch(function (err) {
        return Observable.empty();
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, function (err) {
        expect('this was called').not.toBeTruthy();
      }, function () {
        done();
      });
  });
  
  
  it('should error if you return Observable.throw()', function (done) {
    var expected = [1, 2];
    Observable.create(function(observer) {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    })
      .map(function (n) {
        if (n === 3) {
          throw 'bad';
        }
        return n;
      })
      .catch(function (err) {
        return Observable.throw('haha');
      })
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, function (err) {
        expect(err).toBe('haha');
        done();
      }, function () {
        expect('this was called').not.toBeTruthy();
      });
  });
});