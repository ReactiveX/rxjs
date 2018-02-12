import { SubscriptionLog } from '../SubscriptionLog';
import { ObservableMarbleToken } from './ObservableMarbleToken';
import { subscriptionTokenParseReducer } from './tokenParseReducer';

const parseSubscriptionMarble = (marble: string | null, frameTimeFactor: number = 1, maxFrame = 1000) => {
  if (!marble) {
    return new SubscriptionLog(Number.POSITIVE_INFINITY);
  }

  const marbleTokenArray = Array.from(marble).filter(token => token !== ObservableMarbleToken.NOOP);
  const value = marbleTokenArray.reduce(subscriptionTokenParseReducer(frameTimeFactor, maxFrame), {
    currentTimeFrame: 0,
    subscriptionFrame: Number.POSITIVE_INFINITY,
    unsubscriptionFrame: Number.POSITIVE_INFINITY,
    simultaneousGrouped: false,
    expandingTokenCount: 0,
    expandingValue: []
  });

  return value.unsubscriptionFrame === Number.POSITIVE_INFINITY
    ? new SubscriptionLog(value.subscriptionFrame)
    : new SubscriptionLog(value.subscriptionFrame, value.unsubscriptionFrame);
};

export { parseSubscriptionMarble };
