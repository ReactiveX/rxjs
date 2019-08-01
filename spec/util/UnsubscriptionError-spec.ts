import { expect } from 'chai';
import { UnsubscriptionError, Observable, timer, merge } from 'rxjs';

/** @test {UnsubscriptionError} */
describe('UnsubscriptionError', () => {
  it('should create a message that is a clear indication of its internal errors', () => {
    const err1 = new Error('Swiss cheese tastes amazing but smells like socks');
    const err2 = new Error('User too big to fit in tiny European elevator');
    const source1 = new Observable(() => () => { throw err1; });
    const source2 = timer(1000);
    const source3 = new Observable(() => () => { throw err2; });
    const source = merge(source1, source2, source3);

    const subscription = source.subscribe();

    try {
      subscription.unsubscribe();
    } catch (err) {
      expect(err instanceof UnsubscriptionError).to.equal(true);
      expect(err.errors).to.deep.equal([err1, err2]);
      expect(err.name).to.equal('UnsubscriptionError');
    }
  });
});
