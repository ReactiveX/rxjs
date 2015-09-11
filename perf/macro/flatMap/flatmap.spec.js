var builder = require('../specbuilder');

var preset = new builder.Preset();
var runner = preset.runner;

describe('flatMap comparison', function () {
  var testUrlIdentifier = 'flatMap';
  
  preset.iteration.forEach(function (val) {
    
    it('should be fast in Rx2', function (done) {
      preset.initBrowser(browser, testUrlIdentifier, val);
      var param = preset.sampleParameter('flatMap Rx2', '#rx-2-flatmap', val);
      runner.sample(param).then(done, done.fail);
    });
    
    it('should be fast in RxNext', function (done) {
      preset.initBrowser(browser, testUrlIdentifier , val);
      var param = preset.sampleParameter('flatMap RxNext', '#rx-3-flatmap', val);
      runner.sample(param).then(done, done.fail);
    });
    
  });
});