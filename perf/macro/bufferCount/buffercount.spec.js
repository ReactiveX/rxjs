var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('bufferCount comparison', function () {
  var testUrlIdentifier = 'bufferCount';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('bufferCount Rx2', '#rx-2-bufferCount', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('bufferCount RxNext', '#rx-3-bufferCount', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});