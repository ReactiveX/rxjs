import { ObservableMarbleToken } from '../marbles/ObservableMarbleToken';
import { SubscriptionMarbleToken } from '../marbles/SubscriptionMarbleToken';
import { TestMessage } from '../message/TestMessage';

/**
 * If marble provided custom values, we don't know original token - instead display
 * pseudo alphabet for object based values. If custom value is single-length char or number,
 * it'll be displayed as-is.
 *
 */
const token = Array.from(
  `äḅċḋëḟġḧïjḳḷṁṅöṗqṛṡẗüṿẅẍÿżÄḄĊḊЁḞĠḦЇJḲḶṀṄÖṖQṚṠṪÜṾẄẌŸŻ` +
    `ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ` +
    `🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩` +
    `⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵`
);

/**
 * Take flattened array of test message, aggregate same-frame value into nested arrays.
 *
 */
const marbleGroupReducer = <T>(
  acc: Array<Array<TestMessage<T>>>,
  value: TestMessage<T>
): Array<Array<TestMessage<T>>> => {
  const latestGroup = acc[acc.length - 1];
  if (!latestGroup || latestGroup.length === 0) {
    acc.push([value]);
  } else {
    const latestFrame = latestGroup[latestGroup.length - 1].frame;
    if (value.frame === latestFrame) {
      latestGroup.push(value);
    } else {
      acc.push([value]);
    }
  }
  return acc;
};

//we don't restore identical marble to original - preserve metadata only
const constructObservableMarble = <T = string>(
  value: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>
): string => {
  if (value.length === 0) {
    return Array.from(Array(30)).map(() => ObservableMarbleToken.TIMEFRAME).join('');
  }

  const groupedMarble: Array<Array<TestMessage<T>>> = value.reduce(marbleGroupReducer, []);
  const tokens = [...token];

  let group: Array<TestMessage<T>>;
  let completed: boolean = false;
  let timeFrame: number = 0;
  let marbleString = '';
  let shiftedFrame: number = Number.NEGATIVE_INFINITY;

  const appendNotificationValue = (message: TestMessage<T>) => {
    const completed = message.notification.kind === 'C' || message.notification.kind === 'E';
    if (completed) {
      marbleString += message.notification.kind === 'C' ? ObservableMarbleToken.COMPLETE : ObservableMarbleToken.ERROR;
      return true;
    } else {
      const value = message.notification.value;
      if (value.toString().length === 1) {
        marbleString += message.notification.value;
      } else {
        //we can't recover original token when notification metadata has custom value, use pseudo alphabet instead.
        //do not support marble longer than predefined token char.
        marbleString += tokens.shift();
      }
    }
    return false;
  };

  //iterate each groups of message per timeframe
  while ((group = groupedMarble.shift()!)) {
    const single = group.length === 1;
    let message: TestMessage<T>;

    //interate each message in single group
    while ((message = group.shift()!)) {
      //determine if there's hot observable subscription, and value emitted before subscription
      if (message.frame < 0 && shiftedFrame < 0) {
        shiftedFrame = Math.abs(message.frame);
      }

      //calcuate frame and calibrate frame to start from 0
      let adjustedFrame = shiftedFrame < 0 ? message.frame : message.frame + shiftedFrame;

      //if frame's 0, value's immediately appended
      if (adjustedFrame === 0) {
        timeFrame++;
      }

      if (adjustedFrame !== 0) {
        //if interval between message's long
        if (adjustedFrame - timeFrame >= 15) {
          while (timeFrame < adjustedFrame) {
            marbleString += `-`;
            const expandedTime = adjustedFrame - timeFrame - 2;
            marbleString += `...${expandedTime}...-`;
            timeFrame = adjustedFrame;
          }
        } else {
          while (adjustedFrame !== 0 && timeFrame++ < adjustedFrame) {
            marbleString +=
              timeFrame === shiftedFrame + 1 ? SubscriptionMarbleToken.SUBSCRIBE : ObservableMarbleToken.TIMEFRAME;
          }
        }
      }

      //append single message value
      if (single) {
        if ((completed = appendNotificationValue(message))) {
          break;
        }
      } else {
        //append grouped message value
        marbleString += `(`;
        completed = appendNotificationValue(message);

        while ((message = group.shift()!)) {
          if ((completed = appendNotificationValue(message))) {
            break;
          }
        }
        marbleString += `)`;
      }
    }
  }

  if (!completed) {
    marbleString += `-----`;
  }

  return marbleString;
};

export { constructObservableMarble };
