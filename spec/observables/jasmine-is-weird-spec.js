/* globals describe, it, expect, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

/**
 * I'm starting this file to collect tests that when put in other files break jasmine for
 * no apparent reason. It seems like maybe we should move off of jasmine, but moving >1700 tests
 * sounds really gross, so I don't want to do that...
 */
describe('jasmine is weird', function () {
  describe('bindCallback', function () {
    // HACK: If you move this test under the bindCallback-spec.js file, it will arbitrarily
    // break one bufferWhen-spec.js test.
    it('should not even call the callbackFn if immediately unsubscribed', function () {
      var calls = 0;
      function callback(datum, cb) {
        calls++;
        cb(datum);
      }
      var boundCallback = Observable.bindCallback(callback, null, rxTestScheduler);
      var results1 = [];

      var source = boundCallback(42);

      var subscription = source.subscribe(function (x) {
        results1.push(x);
      }, null, function () {
        results1.push('done');
      });

      subscription.unsubscribe();

      rxTestScheduler.flush();

      expect(calls).toBe(0);
    });
  });
});