import { expect } from 'chai';
import { parseSubscriptionMarble } from '../../../src/internal/testing/marbles/parseSubscriptionMarble';
import { subscribe } from '../../../src/internal/testing/message/TestMessage';

describe('parseSubscriptionMarble', () => {
  it('should parse subscription', () => {
    const marble = '--^-----';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(2);

    expect(subscription).to.deep.equal(expected);
  });

  it('should parse unusubscription', () => {
    const marble = '----------!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(Number.POSITIVE_INFINITY, 10);

    expect(subscription).to.deep.equal(expected);
  });

  it('should parse subscription with unsubscription', () => {
    const marble = '--^-----!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(2, 8);

    expect(subscription).to.deep.equal(expected);
  });

  it('should parse subscription with unsubscription with maxFrame', () => {
    const marble = '--^-----!';

    const subscription = parseSubscriptionMarble(marble, 1, 5);
    const expected = subscribe(2, Number.POSITIVE_INFINITY);

    expect(subscription).to.deep.equal(expected);
  });

  it('should support custom timeframe value', () => {
    const marble = '--^-----!';

    const subscription = parseSubscriptionMarble(marble, 10);
    const expected = subscribe(20, 80);

    expect(subscription).to.deep.equal(expected);
  });

  it('should support custom timeframe value with maxFrame', () => {
    const marble = '--^-----!';

    const subscription = parseSubscriptionMarble(marble, 10, 50);
    const expected = subscribe(20, Number.POSITIVE_INFINITY);

    expect(subscription).to.deep.equal(expected);
  });

  it('should allow whitespace', () => {
    const marble = '-- ^   -----!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(2, 8);

    expect(subscription).to.deep.equal(expected);
  });

  it('should allow expanding timeframe', () => {
    const marble = '--...14...^-----!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(16, 22);

    expect(subscription).to.deep.equal(expected);
  });

  it('should return infinite subscription with null', () => {
    const subscription = parseSubscriptionMarble(null);

    expect(subscription).to.deep.equal(subscribe(Number.POSITIVE_INFINITY));
  });

  it('should allow simultaneous value', () => {
    //             '-v   --^---v   ---!'
    const marble = '-(ab)--^---(cd)---!';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(4, 12);

    expect(subscription).to.deep.equal(expected);
  });

  it('should allow grouped simultaneous sub-unsub', () => {
    const marble = '(^!)';

    const subscription = parseSubscriptionMarble(marble);
    const expected = subscribe(0, 0);

    expect(subscription).to.deep.equal(expected);
  });

  it('should throw when try to nest simultaneous value', () => {
    const marble = '-----(a(b|))';

    expect(() => parseSubscriptionMarble(marble)).to.throw();
  });

  it('should throw when try to set timeframe in simultaneous value', () => {
    const marble = '-------(a-b)';

    expect(() => parseSubscriptionMarble(marble)).to.throw();
  });

  it('should throw if expanding timeframe does not contain values', () => {
    const marble = '----......----a----';

    expect(() => parseSubscriptionMarble(marble)).to.throw();
  });
});
