import { expect } from 'chai';
import { Observable } from '../../src/awaitable';

declare const __root__: any;

/** @test {awaitable} */
describe('Observable.prototype.toPromise', () => {
  it('should convert an Observable to a promise of its last value', async () => {
    const x = await Observable.of(1, 2, 3);
    expect(x).to.equal(3);
  });

  it('should handle errors properly', async () => {
    try {
      return await Observable.throwError('bad');
    } catch (err) {
      expect(err).to.equal('bad');
      return err;
    }
  });
});
