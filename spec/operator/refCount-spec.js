/* globals describe, it, expect, Symbol */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;
var Subject = RxNext.Subject;
var Observer = RxNext.Observer;

describe('Observable.prototype.publish().refCount()', function () {
  it('should count references', function () {
    var source = Observable.value(1).publish().refCount();
       
    source[Symbol.observer](Observer.create(function () { }));
    source[Symbol.observer](Observer.create(function () { }));
    source[Symbol.observer](Observer.create(function () { }));
    
    expect(source.refCount).toBe(3);
  });
  
  it('should unsub from the source when all other subscriptions are unsubbed', function (done) {
    var unsubscribeCalled = false;
    var source = Observable.create(function (observer) {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.next(5);
      observer.next(6);
      observer.return();
      
      return function () {
        unsubscribeCalled = true;
      }
    }).publish().refCount();
    
    source.take(1).subscribe(function () {});
    source.take(3).subscribe(function () {});
    source.take(5).subscribe(function (x) {
      if (x > 3) {
        expect(source.refCount).toBe(1);
      }
    }, null, function () {
      setTimeout(function () {
        expect(source.refCount).toBe(0);
        expect(unsubscribeCalled).toBe(true);
        done();
      })
    });
  });
});