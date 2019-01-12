import { expect } from 'chai';
import { of, spawn } from 'rxjs';

/** @test {spawn} */
describe('spawn', () => {
  it('should step through yielded observables', (done) => {
    const spawned = spawn(function* () {
      const a = yield ['a'];
      const b = yield of('b');
      const c = yield Promise.resolve('c');
      return a + b + c;
    });
    spawned.subscribe((x) => {
      expect(x).to.equal('abc');
      done();
    });
  });
});
