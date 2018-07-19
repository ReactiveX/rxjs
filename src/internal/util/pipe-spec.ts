import { pipe } from "rxjs/internal/util/pipe";
import { expect } from "chai";
import { noop } from "rxjs/internal/util/noop";

describe('pipe', () => {
  it('should chain multiple functions one after the other', () => {
    const result = pipe<string>(
      x => x + '?',
      x => x + '!',
      x => x + '.',
    )('good');

    expect(result).to.equal('good?!.');
  });

  it('should return a noop if no arguments are passed', () => {
    const result = pipe();
    expect(result).to.equal(noop);
  });
});
