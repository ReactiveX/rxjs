import { expect } from 'chai';
import { noop, Subject, Subscriber } from 'rxjs';
import { reportError } from 'rxjs/internal/util/reportError';
import * as sinon from 'sinon';

describe('reportError', () => {
  it('should report errors to an observer if possible', () => {
    const error = new Error('kaboom');
    const subscriber = new Subscriber(noop, e => console.log(e));
    const errorStub = sinon.stub(subscriber, 'error');
    const reportStub = sinon.stub();
    reportError(error, subscriber, reportStub);
    expect(errorStub).to.have.property('called', true);
    expect(reportStub).to.have.property('called', false);
  });

  it('should not report errors to a stopped observer', () => {
    const error = new Error('kaboom');
    const subscriber = new Subscriber(noop);
    subscriber.error(error);
    const errorStub = sinon.stub(subscriber, 'error');
    const reportStub = sinon.stub();
    reportError(error, subscriber, reportStub);
    expect(errorStub).to.have.property('called', false);
    expect(reportStub).to.have.property('called', true);
  });

  it('should not report errors to a closed observer', () => {
    const error = new Error('kaboom');
    const subject = new Subject<{}>();
    subject.unsubscribe();
    const errorStub = sinon.stub(subject, 'error');
    const reportStub = sinon.stub();
    reportError(error, subject, reportStub);
    expect(errorStub).to.have.property('called', false);
    expect(reportStub).to.have.property('called', true);
  });

  it('should not report errors an observer with a stopped destination', () => {
    const error = new Error('kaboom');
    const destination = new Subscriber(noop);
    const subscriber = new Subscriber(destination);
    destination.error(error);
    const errorStub = sinon.stub(subscriber, 'error');
    const reportStub = sinon.stub();
    reportError(error, subscriber, reportStub);
    expect(errorStub).to.have.property('called', false);
    expect(reportStub).to.have.property('called', true);
  });
});
