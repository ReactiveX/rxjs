/* globals describe, it, expect */
var Rx = require('../index');

describe('Root Module', function () {
  it('should contain exports from commonjs modules', function () {
	  expect(typeof Rx.Observable).toBe('function');
  });
});
