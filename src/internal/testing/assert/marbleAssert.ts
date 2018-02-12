import { SubscriptionLog } from '../SubscriptionLog';
import { TestMessage } from '../message/TestMessage';
import { constructObservableMarble } from './constructObservableMarble';
import { constructSubscriptionMarble } from './constructSubscriptionMarble';

let matchers: {
  matcherHint: any,
  printExpected: any,
  printReceived: any,
  toEqualAssert: any
} | null = null;

/**
 * Load matchers for assertion.
 *
 * NOTE: Currently testing packages are included in core and we do not want to specify
 * explicit dependency only for testing - making it as peerdeps for opt-in who uses assertion
 * and load lazyly.
 *
 * TODO: convert to static ES import once we have separate package for testing
 */
const getMatchers = () => {
  if (matchers) {
    return matchers;
  }

  const { matcherHint, printExpected, printReceived } = require('jest-matcher-utils'); //tslint:disable-line:no-require-imports
  const { toEqual } = require('jest-matchers/build/matchers'); //tslint:disable-line:no-require-imports

  return matchers = { matcherHint, printExpected, printReceived, toEqualAssert: toEqual.bind({ expand: false }) };
};

//const toEqualAssert = toEqual.bind({ expand: false });

const subscriptionMarbleAssert = (source: Array<SubscriptionLog>) => (expected: Array<SubscriptionLog>) => {
  const { matcherHint, printExpected, printReceived, toEqualAssert } = getMatchers();
  const asserted = toEqualAssert(source, expected);

  if (!asserted.pass) {
    const length = source.length > expected.length ? source.length : expected.length;
    let description = `
${matcherHint(' to equal ')}
    `;

    for (let idx = 0; idx < length; idx++) {
      const sourceMarble = !!source[idx]
        ? constructSubscriptionMarble(source[idx])
        : { marbleString: '', frameString: '' };
      const expectedMarble = !!expected[idx]
        ? constructSubscriptionMarble(expected[idx])
        : { marbleString: '', frameString: '' };

      if (toEqualAssert(sourceMarble, expectedMarble).pass) {
        continue;
      }

      description += `

${printReceived(`Source:   ${sourceMarble.marbleString}`)}
${printReceived(`          ${sourceMarble.frameString}`)}
${printExpected(`Expected: ${expectedMarble.marbleString}`)}
${printExpected(`          ${expectedMarble.frameString}`)}
      `;
    }
    description += `
${asserted.message()}
`;
    throw new Error(description);
  }
};

const observableMarbleAssert = <T = string>(source: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>) => (
  expected: Array<TestMessage<T>> | Readonly<Array<TestMessage<T>>>
) => {
  if (!Array.isArray(expected)) {
    throw new Error('Expected value is not array');
  }
  const { matcherHint, printExpected, printReceived, toEqualAssert } = getMatchers();

  //polymorphic picks up observablemarbleassert first when empty array, manually falls back
  //if expected is subscriptionlog
  if ((expected as any).every((x: any) => x instanceof SubscriptionLog)) {
    subscriptionMarbleAssert(source as any)(expected as any);
    return;
  }

  const sourceMarble = constructObservableMarble(source);
  const expectedMarble = constructObservableMarble(expected);

  //Notification<T> have class method / static method prevents deep equality comparison, picks POJO values only
  const sourceValue = source.map(({ frame, notification }) => ({ frame, notification: { ...notification } }));
  const expectedValue = expected.map(({ frame, notification }) => ({ frame, notification: { ...notification } }));

  const asserted = toEqualAssert(sourceValue, expectedValue);

  if (!asserted.pass) {
    const description = `
${printReceived(`Source:   ${sourceMarble}`)}
${printExpected(`Expected: ${expectedMarble}`)}

${asserted.message()}
    `;
    throw new Error(description);
  }
};

function marbleAssert<T = string>(
  source: Array<TestMessage<T | Array<TestMessage<T>>>> | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
): {
    to: {
      equal(
        expected: TestMessage<T | Array<TestMessage<T>>> | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
      ): void;
    };
  };
function marbleAssert<T = void>(
  source: Array<SubscriptionLog>
): { to: { equal(expected: Array<SubscriptionLog>): void } };
function marbleAssert<T = string>(
  source:
    | Array<SubscriptionLog>
    | Array<TestMessage<T | Array<TestMessage<T>>>>
    | Readonly<Array<TestMessage<T | Array<TestMessage<T>>>>>
): { to: { equal(expected: object): void } } {
  const isSourceArray = Array.isArray(source);
  if (!isSourceArray) {
    throw new Error('Cannot assert non array');
  }

  const isSourceSubscription = source.length > 0 && (source as Array<any>).every(v => v instanceof SubscriptionLog);

  return {
    to: {
      equal: isSourceSubscription ? subscriptionMarbleAssert(source as any) : observableMarbleAssert(source as any)
    }
  };
}

export { marbleAssert, constructSubscriptionMarble };
