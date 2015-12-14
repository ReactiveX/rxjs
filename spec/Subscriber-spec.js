/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');
var Subscriber = Rx.Subscriber;

describe('Subscriber', function () {
  it('should have the rxSubscriber symbol', function () {
    var sub = new Subscriber();
    expect(sub[Rx.Symbol.rxSubscriber]()).toBe(sub);
  });
});