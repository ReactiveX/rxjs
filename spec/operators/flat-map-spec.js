var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.flatMap()', function () {
  it('should map and flatten', function (done) {
    var source = Observable.of(1, 2, 3, 4).flatMap(function (x) {
      return Observable.of(x + '!');
    });

    var expected = ['1!', '2!', '3!', '4!'];
    var i = 0;

    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });
  it('should map and flatten an Array', function (done) {
    var source = Observable.of(1, 2, 3, 4).flatMap(function (x) {
      return [x + '!'];
    });

    var expected = ['1!', '2!', '3!', '4!'];
    var i = 0;

    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });
});