var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('zip comparison', function () {
  var testUrlIdentifier = 'zip';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('zip Rx2', '#rx-2-zip', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('zip RxNext', '#rx-3-zip', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});