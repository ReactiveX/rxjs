/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Notification = Rx.Notification;

describe('Observable.prototype.materialize()', function () {
  it('should materialize a happy stream', function () {
    var expected = [
      Notification.createNext(1),
      Notification.createNext(2),
      Notification.createNext(3),
      Notification.createComplete()
    ];
    
    Observable.of(1, 2, 3)
      .materialize()
      .subscribe(function (n) {
        expect(n instanceof Notification).toBe(true);
        expect(n).toEqual(expected.shift());
      });
  });
  
  it('should materialize a sad stream', function () {
    var expected = [
      Notification.createNext(1),
      Notification.createNext(2),
      Notification.createNext(3),
      Notification.createError('booooo')
    ];
    
    Observable.of(1, 2, 3, 4)
      .map(function (x) {
        if (x === 4) {
          throw 'booooo';
        }
        return x;
      })
      .materialize()
      .subscribe(function (n) {
        expect(n).toEqual(expected.shift());
      });
  });
});