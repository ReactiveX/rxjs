/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.startWith()', function () {
  it('should start an observable with given value', function (done) {
    var source = 'source'
    var init = 'init';
    var expected = [init, source];

    var i = 0;
    Observable.of(source)
      .startWith(init)
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, function () {
        done();
      });
  });
});
