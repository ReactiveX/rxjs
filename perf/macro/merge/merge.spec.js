var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('merge comparison', function () {
  var testUrlIdentifier = 'merge';

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('merge Rx2', '#rx-2-merge', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('merge RxNext', '#rx-3-merge', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});