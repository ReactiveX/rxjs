var Scheduler = require('../../dist/cjs/Scheduler');
var of = require('../../dist/cjs/observable/of');
var selectMany = require('../../dist/cjs/operator/selectMany');

describe("select many", function () {
  it("should merge with a selector function", function () {
    var a = of(1, 2, 3);
    var b = of(4, 5, 6, 7, 8);
    var r = [4, 5, 6, 7, 8, 4, 5, 6, 7, 8, 4, 5, 6, 7, 8];
    var i = 0;
    selectMany.call(a, function(x) { return b; }).subscribe(function(x) {
      expect(x).toEqual(r[i++]);
    }, null, null);
  });
  it("should merge with an Observable", function () {
    var a = of(1, 2, 3);
    var b = of(4, 5, 6, 7, 8);
    var r = [4, 5, 6, 7, 8, 4, 5, 6, 7, 8, 4, 5, 6, 7, 8];
    var i = 0;
    selectMany.call(a, b).subscribe(function(x) {
      expect(x).toEqual(r[i++]);
    }, null, null);
  });
});