import { pipe } from "rxjs/internal/util/pipe";
import { expect } from "chai";
import { identity } from "rxjs/internal/util/identity";

describe('pipe', () => {
  it('should chain multiple functions one after the other', () => {
    const result = pipe(
      x => x + '?',
      x => x + '!',
      x => x + '.',
    )('good');

    expect(result).to.equal('good?!.');
  });

  it('should return a identity if no arguments are passed', () => {
    const result = pipe();
    expect(result).to.equal(identity);
    expect(result('foo')).to.equal('foo');
  });
});
