import { expect } from 'chai';
import { Notification } from '../../../src/internal/Notification';
import { complete, error, next, subscribe, TestMessageValue } from '../../../src/internal/testing/message/TestMessage';

describe('TestMessageValue', () => {
  it('should create metadata', () => {
    const notification = Notification.createNext('meh');

    const message = new TestMessageValue(10, notification);

    expect(message.frame).to.equal(10);
    expect(message.notification).to.deep.equal(notification);
  });

  describe('utility function', () => {
    it('should create next', () => {
      const value = next(10, 'meh');

      expect(value).to.deep.equal(new TestMessageValue(10, Notification.createNext('meh')));
    });

    it('should create error', () => {
      const errorValue = error(10, 'meh');

      expect(errorValue).to.deep.equal(new TestMessageValue(10, Notification.createError('meh')));
    });

    it('should create complete', () => {
      const completeValue = complete(10);

      expect(completeValue).to.deep.equal(new TestMessageValue(10, Notification.createComplete()));
    });

    it('should create subscription log', () => {
      const withUnsub = subscribe(10, 20);
      const withoutSub = subscribe(10);
      const emptySub = subscribe();

      expect(withUnsub).to.deep.equal(subscribe(10, 20));
      expect(withoutSub).to.deep.equal(subscribe(10, Number.POSITIVE_INFINITY));
      expect(emptySub).to.deep.equal(subscribe(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
    });
  });
});
