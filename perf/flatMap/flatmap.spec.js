var benchpress = require('benchpress');
var runner = new benchpress.Runner([
  benchpress.SeleniumWebDriverAdapter.PROTRACTOR_BINDINGS,
  benchpress.Validator.bindTo(benchpress.RegressionSlopeValidator),
  benchpress.bind(benchpress.RegressionSlopeValidator.SAMPLE_SIZE).toValue(10),
  benchpress.bind(benchpress.RegressionSlopeValidator.METRIC).toValue('script'),
  benchpress.bind(benchpress.Options.FORCE_GC).toValue(false)
]);

describe('flatMap comparison', function() {
  it('should be fast in Rx3', function(done) {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:8080/perf/flatMap/index.html');
    runner.sample({
      id: 'flatMap Rx3',
      execute: function() {
        $('#rx-3-flatmap').click();
      }
    }).then(done, done.fail);
  });


  it('should be fast in Rx2', function (done) {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:8080/perf/flatMap/index.html');
    runner.sample({
      id: 'flatMap Rx2',
      execute: function() {
        $('#rx-2-flatmap').click();
      }
    }).then(done, done.fail);
  });
});