var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('windowCount comparison', function () {
  var testUrlIdentifier = 'windowCount';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('windowCount Rx2', '#rx-2-windowCount', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('windowCount RxNext', '#rx-3-windowCount', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});