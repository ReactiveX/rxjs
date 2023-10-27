import * as _ from 'lodash';
import * as chai from 'chai';
import { ErrorNotification, NextNotification, ObservableNotification } from 'rxjs';
import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { SubscriptionLog } from 'rxjs/internal/testing/subscription-logging';

function stringifyValue(obj: any): string {
  // Handle null
  if (obj === null) {
    return 'null';
  }

  // Check if it's a plain object
  if (typeof obj === 'object' && (Array.isArray(obj) || obj.constructor === Object)) {
    return JSON.stringify(obj);
  }

  // If it's an instance of a class (or built-in like Date, RegExp, etc.)
  if (typeof obj === 'object' && obj.constructor && obj.constructor.name) {
    return `[instanceof ${obj.constructor.name}]`;
  }

  // Just in case there's some edge case not covered, return a generic string representation
  return String(obj);
}

function testMessageToString(testMessage: TestMessage, indent: number, frameOffset: number) {
  const indentation = '  '.repeat(indent);
  const { notification, frame } = testMessage;
  const currentFrame = frame + frameOffset;
  let result = `\t${indentation}${currentFrame}: `;

  switch (notification.kind) {
    case 'N':
      if (isTestMessageArray(notification.value)) {
        result += `$ {\n${indentation}${testMessagesToString(notification.value, indent + 1, currentFrame)}\n\t${indentation}}`;
      } else {
        result += stringifyValue(notification.value);
      }
      break;
    case 'E':
      result += 'ERROR';
      if (notification.error?.name) {
        result += ` ${notification.error.name}`;
      }
      if (notification.error?.message) {
        result += `: ${notification.error.message}`;
      }
      break;
    case 'C':
      result += 'COMPLETE';
      break;
  }

  return result;
}

function testMessagesToString(testMessages: TestMessage[], indent = 0, frameOffset = 0) {
  return testMessages.map((testMessage) => testMessageToString(testMessage, indent, frameOffset)).join('\n');
}

export function observableMatcher(actual: any, expected: any) {
  if (!testMessagesEqual(actual, expected)) {
    if (isTestMessageArray(expected)) {
      let message = '\n\tExpected \n';
      message += testMessagesToString(actual, 1);
      message += '\n\tto equal \n';
      message += testMessagesToString(expected, 1);

      chai.assert(false, message);
    } else {
      let message = '\n\tExpected \n';
      message += '\t\t' + JSON.stringify(actual);
      message += '\n\tto equal \n';
      message += '\t\t' + JSON.stringify(expected);

      chai.assert(false, message);
    }
  }
}

function testMessagesEqual(expected: SubscriptionLog[] | TestMessage[], actual: SubscriptionLog[] | TestMessage[]) {
  if (expected.length !== actual.length) {
    // If they're not the same length, we know they're not equal.
    return false;
  }

  if (expected.length === 0) {
    // Two empty arrays are always going to be equal.
    return true;
  }

  if (isTestMessageArray(expected)) {
    if (!isTestMessageArray(actual)) {
      return false;
    }

    // TestMessages
    for (let i = 0; i < expected.length; i++) {
      const aMsg = expected[i];
      const bMsg = actual[i];
      if (aMsg.frame !== bMsg.frame) {
        return false;
      }
      const aNotification = aMsg.notification;
      const bNotification = bMsg.notification;

      if (aNotification.kind !== bNotification.kind) {
        return false;
      }
      if (aNotification.kind === 'N') {
        const aNotificationValue = aNotification.value;
        const bNotificationValue = (bNotification as NextNotification<any>).value;

        if (isTestMessageArray(aNotificationValue)) {
          // We are testing inner observable values.
          // That means we'll be matching test messages for that inner observable.
          if (!isTestMessageArray(bNotificationValue)) {
            return false;
          }

          if (!testMessagesEqual(aNotificationValue, bNotificationValue)) {
            return false;
          }
        } else {
          return _.isEqual(aNotificationValue, bNotificationValue);
        }
      } else if (aNotification.kind === 'E') {
        return errorNotifcationsEqual(aNotification, bNotification as ErrorNotification);
      }
    }
    return true;
  }

  if (isSubscriptionLogArray(expected)) {
    if (!isSubscriptionLogArray(actual)) {
      return false;
    }

    for (let i = 0; i < expected.length; i++) {
      const aLog = expected[i];
      const bLog = actual[i];

      if (aLog.subscribedFrame !== bLog.subscribedFrame || aLog.unsubscribedFrame !== bLog.unsubscribedFrame) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function errorNotifcationsEqual(a: ErrorNotification, b: ErrorNotification) {
  return a.error.name === b.error.name && a.error.message === b.error.message;
}

function isTestMessageArray(input: unknown): input is TestMessage[] {
  return isArrayOf<TestMessage>(input, 'frame');
}

function isSubscriptionLogArray(input: unknown): input is SubscriptionLog[] {
  return isArrayOf<SubscriptionLog>(input, 'subscribedFrame');
}

function isArrayOf<T>(input: unknown, propName: keyof T): input is T[] {
  if (!Array.isArray(input)) {
    return false;
  }

  // An empty array could match any type of array.
  if (input.length === 0) {
    return true;
  }

  const first = input[0];
  return typeof first === 'object' && first && propName in first;
}
