import { expect } from 'chai';
import { compose } from '../../dist/cjs/util/compose';

describe('compose', () => {
  it('should exist', () => {
    expect(compose).to.be.a('function');
  });

  it('should compose two functions together', () => {
    const a = x => x + x;
    const b = x => x - 1;

    const c = compose(a, b);
    expect(c).to.be.a('function');
    expect(c(1)).to.equal(1);
    expect(c(10)).to.equal(19);
  });

  it('should return the same function if only one is passed', () => {
    const a = x => x;
    const c = compose(a);

    expect(c).to.equal(a);
  });

  it('should return a noop if not passed a function', () => {
    const c = compose();

    expect(c('whatever')).to.equal('whatever');
    const someObj = {};
    expect(c(someObj)).to.equal(someObj);
  });
});
