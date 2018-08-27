import { expect } from "chai";

/** Used throughout the test suite to set up TestScheduler */
export function assertDeepEquals(a: any, b: any): void {
  expect(a).to.deep.equal(b);
}
