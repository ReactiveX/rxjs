import { expect } from 'chai';
import { pipe } from 'rxjs';

describe('pipe', () => {
  it('should exist', () => {
    expect(pipe).to.be.a('function');
  });

  it('should pipe two functions together', () => {
    const a = (x: number) => x + x;
    const b = (x: number) => x - 1;

    const c = pipe(a, b);
    expect(c).to.be.a('function');
    expect(c(1)).to.equal(1);
    expect(c(10)).to.equal(19);
  });

  it('should return the same function if only one is passed', () => {
    const a = <T>(x: T) => x;
    const c = pipe(a);

    expect(c).to.equal(a);
  });

  it('should return a noop if not passed a function', () => {
    const c = pipe();

    expect(c('whatever')).to.equal('whatever');
    const someObj = {};
    expect(c(someObj)).to.equal(someObj);
  });
});
