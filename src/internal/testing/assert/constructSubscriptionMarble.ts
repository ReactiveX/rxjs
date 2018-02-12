import { SubscriptionLog } from 'rxjs/testing/SubscriptionLog';
import { ObservableMarbleToken } from '../marbles/ObservableMarbleToken';
import { SubscriptionMarbleToken } from '../marbles/SubscriptionMarbleToken';

const MAX_FRAME_LENGTH = 30;

/**
 * @internal
 */
const constructSubscriptionMarble = ({
  subscribedFrame,
  unsubscribedFrame
}: SubscriptionLog): { marbleString: string; frameString: string } => {
  const marble: Array<ObservableMarbleToken | SubscriptionMarbleToken> = Array.from(Array(MAX_FRAME_LENGTH + 1)).map(
    () => ObservableMarbleToken.TIMEFRAME
  );

  let frameString: string = '';
  let subscribeExpandingTimeFrame: number = Number.POSITIVE_INFINITY;

  if (subscribedFrame !== Number.POSITIVE_INFINITY) {
    if (subscribedFrame > MAX_FRAME_LENGTH) {
      //replace start of marble into `---...${n}...---^`, where
      //n makes subscription frame with prefix, postfix expand token (3, 3 - 6 in total)
      //then remain whole marble length as max frame length
      subscribeExpandingTimeFrame = subscribedFrame - 6;
      marble.unshift(...(Array.from(`---...${subscribeExpandingTimeFrame}...---^`) as any));

      const idx = marble.lastIndexOf(SubscriptionMarbleToken.SUBSCRIBE) + 1;
      while (marble.length > MAX_FRAME_LENGTH + 1) {
        marble.splice(idx, 1);
      }
    } else {
      marble[subscribedFrame] = SubscriptionMarbleToken.SUBSCRIBE;
    }

    const frameIdx = marble.lastIndexOf(SubscriptionMarbleToken.SUBSCRIBE);
    while (frameString.length < frameIdx) {
      frameString += ' ';
    }
    frameString += subscribedFrame;
  }

  if (unsubscribedFrame !== Number.POSITIVE_INFINITY) {
    if (unsubscribedFrame > MAX_FRAME_LENGTH) {
      const isSubscribed = subscribedFrame !== Number.POSITIVE_INFINITY;
      const remaningFrame = isSubscribed
        ? MAX_FRAME_LENGTH - marble.lastIndexOf(SubscriptionMarbleToken.SUBSCRIBE) - 1
        : MAX_FRAME_LENGTH;
      const unsubscribeExpandTimeFrame = isSubscribed
        ? unsubscribedFrame - subscribedFrame + 1 - remaningFrame + 6
        : unsubscribedFrame + 1 - MAX_FRAME_LENGTH + 6;

      let expandedFrame = `...${unsubscribeExpandTimeFrame}...---!`;
      let count = expandedFrame.length;

      // If in-range subscription collides to expanding token, preserve it though it increases length
      const availableTimeFrame = MAX_FRAME_LENGTH - count;
      if (marble.lastIndexOf(SubscriptionMarbleToken.SUBSCRIBE) > availableTimeFrame) {
        const exceedFrameCount = marble.lastIndexOf(SubscriptionMarbleToken.SUBSCRIBE) - availableTimeFrame;
        expandedFrame = `...${unsubscribeExpandTimeFrame - exceedFrameCount}...---!`;
      }

      count = expandedFrame.length;

      while (count-- > 0 && marble[marble.length - 1] !== SubscriptionMarbleToken.SUBSCRIBE) {
        marble.pop();
      }

      marble.push(...(Array.from(expandedFrame) as any));
    } else {
      marble[unsubscribedFrame] = SubscriptionMarbleToken.UNSUBSCRIBE;
    }

    const frameIdx = marble.lastIndexOf(SubscriptionMarbleToken.UNSUBSCRIBE);
    while (frameString.length < frameIdx) {
      frameString += ' ';
    }
    frameString += unsubscribedFrame;

    //strip timeframe after unsubscription
    marble.splice(marble.indexOf(SubscriptionMarbleToken.UNSUBSCRIBE) + 1);
  }

  const marbleString = marble.join('');
  return { marbleString, frameString };
};

export { constructSubscriptionMarble };
