/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('let', function () {
  it('should be able to compose with let', function (done) {
    var expected = ['aa', 'bb'];
    var i = 0;

    var foo = function (observable) {
      return observable
        .map(function (x) {
          return x + x;
        });
    };

    Observable
      .fromArray(['a','b'])
      .let(foo)
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, done);
  });
});
