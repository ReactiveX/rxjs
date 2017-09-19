import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';

const { Observable, UnsubscriptionError } = Rx;

/** @test {UnsubscriptionError} */
describe('UnsubscriptionError', () => {
  it('should create a message that is a clear indication of its internal errors', () => {
    const err1 = new Error('Swiss cheese tastes amazing but smells like socks');
    const err2 = new Error('User too big to fit in tiny European elevator');
    const source1 = Observable.create(() => () => { throw err1; });
    const source2 = Observable.timer(1000);
    const source3 = Observable.create(() => () => { throw err2; });
    const source = source1.merge(source2, source3);

    const subscription = source.subscribe();

    try {
      subscription.unsubscribe();
    } catch (err) {
      expect(err instanceof UnsubscriptionError).to.equal(true);
      expect(err.message).to.equal(`2 errors occurred during unsubscription:
  1) ${err1}
  2) ${err2}`);
      expect(err.name).to.equal('UnsubscriptionError');
    }
  });
});
