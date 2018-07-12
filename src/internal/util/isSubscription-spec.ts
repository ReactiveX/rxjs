import { Subscription } from "../Subscription";
import { expect } from "chai";
import { isSubscription } from "./isSubscription";

describe('isSubscription', () => {
  it('should pass for Subscriptions', () => {
    const s = new Subscription();
    expect(isSubscription(s)).to.be.true;
  });
});
