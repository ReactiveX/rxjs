var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('mergeMap comparison', function () {
  var testUrlIdentifier = 'mergeMap';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('mergeMap Rx2', '#rx-2-mergeMap', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('mergeMap RxNext', '#rx-3-mergeMap', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});