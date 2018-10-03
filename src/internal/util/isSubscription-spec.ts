import { Subscription } from 'rxjs';
import { expect } from 'chai';
import { isSubscription } from 'rxjs/internal/util/isSubscription';

describe('isSubscription', () => {
  it('should pass for Subscriptions', () => {
    const s = new Subscription();
    expect(isSubscription(s)).to.be.true;
  });
});
