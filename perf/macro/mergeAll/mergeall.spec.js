var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('mergeAll comparison', function () {
  var testUrlIdentifier = 'mergeAll' ;

  preset.iteration.forEach(function (val) {
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('mergeAll Rx2', '#rx-2-mergeAll', val);
      runner.sample(param).then(done, done.fail);
    });

    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('mergeAll RxNext', '#rx-3-mergeAll', val);
      runner.sample(param).then(done, done.fail);
    });
  });
});