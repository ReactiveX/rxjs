/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;
var Subject = RxNext.Subject;

describe('Observable.prototype.publish()', function () {
  it('should return a ConnectableObservable', function () {
    var source = Observable.value(1).publish();
    expect(source instanceof RxNext.ConnectableObservable).toBe(true);
  });
  
  it('should multicast one observable to multiple observers', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;
    
    var source = Observable.create(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.return();
    });
    
    var connectable = source.publish();
    
    connectable.subscribe(function (x) {
      results1.push(x);
    });
    
    connectable.subscribe(function (x) {
      results2.push(x);
    });
    
    RxNext.Scheduler.nextTick.schedule(0, null, function () {
      expect(results1).toEqual([]);
      expect(results2).toEqual([]);
    
      connectable.connect();
      
      RxNext.Scheduler.nextTick.schedule(10, null, function () {
        expect(results1).toEqual([1, 2, 3, 4]);
        expect(results1).toEqual([1, 2, 3, 4]);
        expect(subscriptions).toBe(1);
        done();
      });
    });
  });
  
  it('should allow you to reconnect by subscribing again', function (done) {
    var expected = [1, 2, 3, 4];
    var i = 0;
    
    var source = Observable.of(1, 2, 3, 4).publish();
    
    source.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null,
    function () {
      i = 0;
      source.subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, done);
      
      setTimeout(function () {
        source.connect();
      }, 10);
    });
    
    setTimeout(function () {
      source.connect();
    }, 10)
  });
});