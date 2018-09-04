import { expect } from 'chai';
import { noop, Subscriber } from 'rxjs';
import { empty } from 'rxjs/internal/Observer';
import { canReportError } from 'rxjs/internal/util/canReportError';

describe('reportError', () => {
  it('should report errors to an observer if possible', () => {
    const subscriber = new Subscriber(noop);
    expect(canReportError(subscriber)).to.be.true;
  });

  it('should not report errors to a stopped observer', () => {
    const subscriber = new Subscriber(noop);
    subscriber.error(new Error('kaboom'));
    expect(canReportError(subscriber)).to.be.false;
  });

  it('should not report errors to a closed observer', () => {
    expect(canReportError(empty)).to.be.false;
  });

  it('should not report errors an observer with a stopped destination', () => {
    const destination = new Subscriber(noop);
    const subscriber = new Subscriber(destination);
    destination.error(new Error('kaboom'));
    expect(canReportError(subscriber)).to.be.false;
  });
});
