import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const { Observable, EmptyError } = Rx;

/** @test {ObjectUnsubscribedError} */
describe('EmptyError', () => {
  it('should contain a stacktrace', () => {
    const observable = Observable.empty();
    try {
      observable.first().subscribe();
    } catch (err) {
      expect(err instanceof EmptyError).to.equal(true);
      expect(err.stack).to.not.be.undefined;
      expect(err.name).to.equal('EmptyError');
    }
  });
});
