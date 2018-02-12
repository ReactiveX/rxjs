import { TestMessage } from '../message/TestMessage';
import { ObservableMarbleToken } from './ObservableMarbleToken';
import { SubscriptionMarbleToken } from './SubscriptionMarbleToken';
import { observableTokenParseReducer } from './tokenParseReducer';

/**
 * Parse marble DSL diagram, generates array of TestMessageValue for metadata of each marble values to be scheduled into.
 *
 * @param {string} marble Marble diagram to parse
 * @param {{ [key: string]: T }} [value] Custom value for marble value
 * @param {any} [error] Custom error for marble error
 * @param {boolean} [materializeInnerObservables] Flatten inner observables in cold observable. False by default.
 * @param {number} [frameTimeFactor] Custom frametime factor for virtual time frame. 1 by default.
 */
const parseObservableMarble = <T = string>(
  marble: string,
  value?: { [key: string]: T } | null,
  error?: any,
  materializeInnerObservables: boolean = false,
  frameTimeFactor = 1,
  maxFrame = 1000
): Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>> => {
  if (marble.indexOf(SubscriptionMarbleToken.UNSUBSCRIBE) !== -1) {
    throw new Error(`Observable marble cannot have unsubscription marker ${SubscriptionMarbleToken.UNSUBSCRIBE}`);
  }

  const marbleTokenArray = Array.from(marble).filter(token => token !== ObservableMarbleToken.NOOP);

  const subscriptionIndex = marbleTokenArray.join('').indexOf(SubscriptionMarbleToken.SUBSCRIBE) * frameTimeFactor;
  const frameOffset = subscriptionIndex < 0 ? 0 : -subscriptionIndex;

  const values = marbleTokenArray.reduce(
    observableTokenParseReducer(value || null, error, materializeInnerObservables, frameTimeFactor, maxFrame),
    {
      currentTimeFrame: frameOffset,
      messages: [],
      simultaneousGrouped: false,
      expandingTokenCount: 0,
      expandingValue: []
    }
  );

  return values.messages;
};

export { parseObservableMarble };
