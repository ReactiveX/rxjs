/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');
var Subscriber = Rx.Subscriber;

describe('Subscriber', function () {
  it('should have the rxSubscriber symbol', function () {
    var sub = new Subscriber();
    expect(sub[Rx.Symbol.rxSubscriber]()).toBe(sub);
  });

  describe('when created through create()', function () {
    it('should not call error() if next() handler throws an error', function () {
      var errorSpy = jasmine.createSpy('error');
      var completeSpy = jasmine.createSpy('complete');

      var subscriber = Subscriber.create(
        function next(value) {
          if (value === 2) {
            throw 'error!';
          }
        },
        errorSpy,
        completeSpy
      );

      subscriber.next(1);
      expect(function () {
        subscriber.next(2);
      }).toThrow('error!');

      expect(errorSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();
    });
  });
});
