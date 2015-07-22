/* globals describe, it, expect */
var RxNext = require('../index');

describe('Root Module', function () {
  it('should contain exports from commonjs modules', function () {
	  expect(typeof RxNext.Observable).toBe('function');
  });
});
