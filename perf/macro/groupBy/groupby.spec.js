var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('groupBy comparison', function () {
  var testUrlIdentifier = 'groupBy';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('groupBy Rx2', '#rx-2-groupBy', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('groupBy RxNext', '#rx-3-groupBy', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});