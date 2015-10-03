var benchpress = require('benchpress');

exports.Preset = (function () {
  function Preset() {
    this.iteration = arguments.length ? Array.prototype.slice.call(arguments) : [1000, 10000];
    this.runner = new benchpress.Runner([
      benchpress.SeleniumWebDriverAdapter.PROTRACTOR_BINDINGS,
      benchpress.Validator.bindTo(benchpress.RegressionSlopeValidator),
      benchpress.bind(benchpress.RegressionSlopeValidator.SAMPLE_SIZE).toValue(20),
      benchpress.bind(benchpress.RegressionSlopeValidator.METRIC).toValue('scriptTime'),
      benchpress.bind(benchpress.Options.FORCE_GC).toValue(false)
    ]);
  }

  Preset.prototype.initBrowser = function (browser, url, value) {
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:8080/perf/macro/' + url + '/index.html?iterations=' + value);
  };

  Preset.prototype.sampleParameter = function (sampleId, documentId, value) {
    return {
      id: sampleId,
      execute: function () {
        $(documentId).click();
      },
      bindings: [
        benchpress.bind(benchpress.Options.SAMPLE_DESCRIPTION).toValue({
          iterations: value
        })
      ]};
  };

  return Preset;
})();
