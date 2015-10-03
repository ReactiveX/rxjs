var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('combineLatest comparison', function () {
  var testUrlIdentifier = 'combineLatest';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('combineLatest Rx2', '#rx-2-combineLatest', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('combineLatest RxNext', '#rx-3-combineLatest', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});