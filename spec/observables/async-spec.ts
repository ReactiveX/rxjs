import { expect } from 'chai';
import { of, async } from 'rxjs';

// REVIEWER: Before I invest in writing more tests, I want to make sure I'm on
// the right path to an accepted contribution.

/** @test {async} */
describe('async', () => {
  it('should step through yielded observables', (done) => {
    const f = async(function* (d) {
      const a = yield ['a'];
      const b = yield of('b');
      const c = yield Promise.resolve('c');
      return a + b + c + d;
    });
    const observable = f('d');
    observable.subscribe((x) => {
      expect(x).to.equal('abcd');
      done();
    });
  });
});
