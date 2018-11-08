import { expect } from 'chai';

/** Used throughout the test suite to set up TestScheduler */
export function assertDeepEquals(actual: any, expected: any): void {
  expect(actual.map(deleteErrorNotificationStack)).to.deep.equal(expected.map(deleteErrorNotificationStack));
}

function deleteErrorNotificationStack(marble: any) {
  const { notification } = marble;
  if (notification) {
    const { kind, error } = notification;
    if (kind === 'E' && error instanceof Error) {
      notification.error = { name: error.name, message: error.message };
    }
  }
  return marble;
}
