/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

var noop = function () { };

describe('Observable.prototype.groupBy()', function () {
  
  it('should group values', function (done) {
    var expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2] }
    ];
  
    Observable.of(1, 2, 3)
      .groupBy(function (x) { return x % 2 })
      .subscribe(function (g) {
        var expectedGroup = expectedGroups.shift();
        expect(g.key).toBe(expectedGroup.key);
        
        g.subscribe(function (x) {
          expect(x).toBe(expectedGroup.values.shift());
        });
      }, null, done);
  });
  
  it('should group values with an element selector', function (done) {
    var expectedGroups = [
      { key: 1, values: ['1!', '3!'] },
      { key: 0, values: ['2!'] }
    ];

    Observable.of(1, 2, 3)
      .groupBy(function (x) { return x % 2 }, function (x) { return x + '!'; })
      .subscribe(function (g) {
        var expectedGroup = expectedGroups.shift();
        expect(g.key).toBe(expectedGroup.key);

        g.subscribe(function (x) {
          expect(x).toBe(expectedGroup.values.shift());
        });
      }, null, done);
  });
  
  
  it('should group values with a duration selector', function (done) {
    var expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2, 4] },
      { key: 1, values: [5] },
      { key: 0, values: [6] }
    ];
  
    Observable.of(1, 2, 3, 4, 5, 6)
      .groupBy(function (x) { return x % 2 }, function (x) { return x; }, function (g) { return g.skip(1); })
      .subscribe(function (g) {
        var expectedGroup = expectedGroups.shift();
        expect(g.key).toBe(expectedGroup.key);
        
        g.subscribe(function (x) {
          expect(x).toBe(expectedGroup.values.shift());
        });
      }, null, done);
  });
});