
var of = require('rxjs/observable/of').of;
var of1 = require('rxjs1/observable/of').of;
var from1 = require('rxjs1/observable/from').from;
var mergeMap = require('rxjs/operators/mergeMap').mergeMap;
var mergeMap1 = require('rxjs1/operators/mergeMap').mergeMap;

var actual = [];
var expected = [1];

var id = setTimeout(function () {
  throw new Error('TIMEOUT: Observable did not complete');
}, 200);

of1(0).pipe(
  mergeMap1(function (x) { return of(x); }),
  mergeMap(function () { return from1(Promise.resolve(1)); })
).subscribe({
  next: function (value) { actual.push(value); },
  error: function (err) {
    console.error(err);
    throw new Error('should not error');
  },
  complete: function () {
    if (actual.length !== expected.length || actual[0] !== expected[0] || actual[1] !== expected[1]) {
      throw new Error(actual + ' does not equal ' + expected);
    } else {
      clearTimeout(id);
      console.log('TEST PASSED');
    }
  },
});
