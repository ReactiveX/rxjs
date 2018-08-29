import { expect } from "chai";

/** Used throughout the test suite to set up TestScheduler */
export function assertDeepEquals(actual: any, expected: any): void {
  expect(actual).to.deep.equal(expected);
}
