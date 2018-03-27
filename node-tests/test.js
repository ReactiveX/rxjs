
var rxjs = require('rxjs');
var rxjs1 = require('rxjs1');
var mergeMap = require('rxjs/operators').mergeMap;
var mergeMap1 = require('rxjs1/operators').mergeMap;

var of = rxjs.of;
var of1 = rxjs1.of;
var from1 = rxjs1.from;

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
  error: function () {
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
