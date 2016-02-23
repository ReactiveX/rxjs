import * as Rx from '../../dist/cjs/Rx';
import {DoneSignature} from '../helpers/test-helper';

const Observable = Rx.Observable;

/** @test {throw} */
describe('Observable.throw', () => {
  it('should emit one value', (done: DoneSignature) => {
    let calls = 0;
    Observable.throw('bad').subscribe(() => {
      done.fail('should not be called');
    }, (err: any) => {
      expect(++calls).toBe(1);
      expect(err).toBe('bad');
      done();
    });
  });
});