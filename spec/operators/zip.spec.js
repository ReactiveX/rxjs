var Scheduler = require("../../dist/cjs/Scheduler");
var of = require("../../dist/cjs/observable/of");
var zip = require("../../dist/cjs/operator/zip");
var zipAll = require("../../dist/cjs/operator/zipAll");

describe("zip", function () {
  it("should combine two observables", function () {
    var a = of(1, 2, 3);
    var b = of(4, 5, 6, 7, 8);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    zipAll.call(of(a, b)).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
  it("should combine a source with a second", function () {
    var a = of(1, 2, 3);
    var b = of(4, 5, 6, 7, 8);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    zip.call(a, b).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
  it("should combine two immediately-scheduled observables", function () {
    var a = of(1, 2, 3, Scheduler.immediate);
    var b = of(4, 5, 6, 7, 8, Scheduler.immediate);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    zipAll.call(of(a, b)).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
  it("should combine an immediately-scheduled source with an immediately-scheduled second", function () {
    var a = of(1, 2, 3, Scheduler.immediate);
    var b = of(4, 5, 6, 7, 8, Scheduler.immediate);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    zip.call(a, b).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
});