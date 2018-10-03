import { identity } from 'rxjs';
import { expect } from 'chai';

describe('identity', () => {
  it('should return whatever it is passed', () => {
    const x = {};
    expect(identity(x)).to.equal(x);
  });
});
