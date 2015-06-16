var Scheduler  = require('../../dist/cjs/Scheduler');
var of  = require('../../dist/cjs/observable/of');
var merge  = require('../../dist/cjs/operator/merge');
var mergeAll  = require('../../dist/cjs/operator/mergeAll');

describe("merge", function () {
  it("should merge two observables", function () {
    var a = of(1, 2, 3);
    var b = of(4, 5, 6, 7, 8);
    var r = [1, 2, 3, 4, 5, 6, 7, 8];
    var i = 0;
    mergeAll.call(of(a, b)).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
  it("should merge a source with a second", function () {
    var a = of(1, 2, 3);
    var b = of(4, 5, 6, 7, 8);
    var r = [1, 2, 3, 4, 5, 6, 7, 8];
    var i = 0;
    merge.call(a, b).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
  it("should merge two immediately-scheduled observables", function () {
    var a = of(1, 2, 3, Scheduler.immediate);
    var b = of(4, 5, 6, 7, 8, Scheduler.immediate);
    var r = [1, 4, 2, 5, 3, 6, 7, 8];
    var i = 0;
    mergeAll.call(of(a, b)).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
  it("should merge an immediately-scheduled source with an immediately-scheduled second", function () {
    var a = of(1, 2, 3, Scheduler.immediate);
    var b = of(4, 5, 6, 7, 8, Scheduler.immediate);
    var r = [1, 4, 2, 5, 3, 6, 7, 8];
    var i = 0;
    merge.call(a, b).subscribe(function (vals) {
      expect(vals).toEqual(r[i++]);
    }, null, null);
  });
});