/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.debounce()', function () {
  it('should debounce events', function (done) {
    Observable.of(1, 2, 3).debounce(50)
      .subscribe(function (x) {
        expect(x).toBe(1);
      }, null, done);
  });

  it('should debounce events multiple times', function (done) {
    var expected = ['1-0', '2-0'];
    Observable.concat(
      Observable.timer(0, 10).take(3).map(function (x) { return '1-' + x; }),
      Observable.timer(80, 10).take(5).map(function (x) { return '2-' + x; })
      )
      .debounce(50)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });
});