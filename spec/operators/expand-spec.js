var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.expand()', function () {
  it('should map and recursively flatten', function (done) {
    var expected = [1, 2, 3, 4, 5];
    Observable.of(0).expand(function (x) {
      if (x > 4) {
        return Observable.empty();
      }
      return Observable.of(x + 1);
    })
    .subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });
  it('should map and recursively flatten with ScalarObservables', function (done) {
    var expected = [1, 2, 3, 4, 5];
    Observable.return(0).expand(function (x) {
      if (x > 4) {
        return Observable.empty();
      }
      return Observable.return(x + 1);
    })
    .subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });
});