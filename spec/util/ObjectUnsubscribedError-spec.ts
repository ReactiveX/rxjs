import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const { ObjectUnsubscribedError } = Rx;
const BehaviorSubject = Rx.BehaviorSubject;

/** @test {ObjectUnsubscribedError} */
describe('ObjectUnsubscribedError', () => {
  it('should contain a stacktrace', () => {
    const subject = new BehaviorSubject('hi there');
    subject.unsubscribe();
    try {
      subject.unsubscribe();
    } catch (err) {
      expect(err instanceof ObjectUnsubscribedError).to.equal(true);
      expect(err.stack).to.not.be.undefined;
      expect(err.name).to.equal('ObjectUnsubscribedError');
    }
  });
});
