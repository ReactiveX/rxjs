import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const Observable = Rx.Observable;

/** @test {throw} */
describe('Observable.throw', () => {
  it('should emit one value', (done: MochaDone) => {
    let calls = 0;
    Observable.throw('bad').subscribe(() => {
      done(new Error('should not be called'));
    }, (err: any) => {
      expect(++calls).to.equal(1);
      expect(err).to.equal('bad');
      done();
    });
  });
});