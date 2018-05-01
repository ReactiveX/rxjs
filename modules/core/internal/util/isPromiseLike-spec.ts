import { expect } from "chai";
import { isPromiseLike } from "./isPromiseLike";

describe('isPromiseLike', () => {
  it('should pass for thennables', () => {
    const o = {
      then() { /* noop */ },
    };

    expect(isPromiseLike(o)).to.be.true;
  });

  it('should fail for plain objects', () => {
    expect(isPromiseLike({})).to.be.false;
  });

  it('should fail for nulls', () => {
    expect(isPromiseLike(null)).to.be.false;
  });
});
