var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.prototype.flatMap()', function () {
  it('should map and flatten', function (done) {
    var source = Observable.of(1, 2, 3, 4).flatMap(function(x) {
      return Observable.of(x + '!');
    });
    
    var expected = ['1!', '2!', '3!', '4!'];
    var i = 0;
    
    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, function () {
      done();
    });
  });
});