import { noop } from "rxjs/internal/util/noop";
import { expect } from "chai";

describe('noop', () => {
  it('should be a function that does nothing', () => {
    expect(noop()).to.be.undefined;
  });
});
