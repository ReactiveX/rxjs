var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.mergeMap()', function () {
  it('should map and flatten', function (){
    var source = Observable.of(1, 2, 3, 4).mergeMap(function (x) {
      return Observable.of(x + '!');
    });

    var expected = ['1!', '2!', '3!', '4!'];
    var completed = false;

    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, function(){
      expect(expected.length).toBe(0);
      completed = true;
    });
    
    expect(completed).toBe(true);
  });
  
  it('should map and flatten an Array', function () {
    var source = Observable.of(1, 2, 3, 4).mergeMap(function (x) {
      return [x + '!'];
    });

    var expected = ['1!', '2!', '3!', '4!'];
    var completed = false;

    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, function(){
      expect(expected.length).toBe(0);
      completed = true;
    });
    
    expect(completed).toBe(true);
  });
});