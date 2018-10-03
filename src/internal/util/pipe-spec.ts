import { pipe, identity } from 'rxjs';
import { expect } from 'chai';

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
