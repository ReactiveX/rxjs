//Fail timeouts faster
//Individual suites/specs should specify longer timeouts if needed.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var _ = require("lodash");

beforeEach(function () {
  jasmine.addMatchers({
    toDeepEqual: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          return { pass: _.isEqual(actual, expected) };
        }
      };
    }
  });
});
