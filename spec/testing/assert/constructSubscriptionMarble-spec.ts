import { expect } from 'chai';
import { constructSubscriptionMarble } from '../../../src/internal/testing/assert/constructSubscriptionMarble';
import { subscribe } from '../../../src/internal/testing/message/TestMessage';

describe('constructSubscriptionMarble', () => {
  it('should create marble with subscription in range', () => {
    const sub = subscribe(10, Number.POSITIVE_INFINITY);
    const marble = constructSubscriptionMarble(sub);

    const m = '----------^--------------------';
    const f = '          10';

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with unsubscription in range', () => {
    const sub = subscribe(Number.POSITIVE_INFINITY, 30);
    const marble = constructSubscriptionMarble(sub);

    const m = '------------------------------!';
    const f = '                              30';

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with subscription and unsubscription both in range', () => {
    const sub = subscribe(10, 25);
    const marble = constructSubscriptionMarble(sub);

    const m = '----------^--------------!';
    const f = '          10             25';

    expect(marble.frameString).to.equal(f);

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should strip timeframe after unsubscription', () => {
    const sub = subscribe(Number.POSITIVE_INFINITY, 25);
    const marble = constructSubscriptionMarble(sub);

    const m = '-------------------------!';
    const f = '                         25';

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with subscription out of range', () => {
    const sub = subscribe(40, Number.POSITIVE_INFINITY);
    const marble = constructSubscriptionMarble(sub);

    const m = '---...34...---^----------------';
    const f = '              40';

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with unsubscription out of range', () => {
    const sub = subscribe(Number.POSITIVE_INFINITY, 40);

    const marble = constructSubscriptionMarble(sub);
    //'------------------------------!';
    const m = '-------------------...17...---!';
    const f = '                              40';
    expect(marble.marbleString).to.equal(m);
    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with unsubscription out of range, subscription in range', () => {
    const sub = subscribe(10, 68);

    const marble = constructSubscriptionMarble(sub);

    const m = '----------^--------...46...---!';
    const f = '          10                  68';

    expect(marble.marbleString).to.equal(m);
    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with unsubscription out of range, subscription in expand range', () => {
    const sub = subscribe(40, 68);

    const marble = constructSubscriptionMarble(sub);

    const m = '---...34...---^----...20...---!';
    const f = '              40              68';

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });

  it('should create marble with unsubscription out of range, subscription in collapsable expand range', () => {
    const sub = subscribe(27, 68);
    const marble = constructSubscriptionMarble(sub);

    const m = '---------------------------^...37...---!';
    const f = '                           27          68';

    expect(marble).to.deep.equal({ marbleString: m, frameString: f });
  });
});
