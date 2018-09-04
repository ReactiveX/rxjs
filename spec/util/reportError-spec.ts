import { expect } from 'chai';
import { noop, Subscriber } from 'rxjs';
import { empty } from 'rxjs/internal/Observer';
import { reportError } from 'rxjs/internal/util/reportError';
import * as sinon from 'sinon';

describe('reportError', () => {
  it('should report errors to an observer if possible', () => {
    const consoleStub = sinon.stub(console, 'warn');
    try {
      const error = new Error('kaboom');
      const subscriber = new Subscriber(noop);
      const errorStub = sinon.stub(subscriber, 'error');
      reportError(error, subscriber);
      expect(errorStub).to.have.property('called', true);
      expect(consoleStub).to.have.property('called', false);
    } finally {
      consoleStub.restore();
    }
  });

  it('should not report errors to a stopped observer', () => {
    const consoleStub = sinon.stub(console, 'warn');
    try {
      const error = new Error('kaboom');
      const subscriber = new Subscriber(noop);
      subscriber.error(error);
      const errorStub = sinon.stub(subscriber, 'error');
      reportError(error, subscriber);
      expect(errorStub).to.have.property('called', false);
      expect(consoleStub).to.have.property('called', true);
    } finally {
      consoleStub.restore();
    }
  });

  it('should not report errors to a closed observer', () => {
    const consoleStub = sinon.stub(console, 'warn');
    try {
      const error = new Error('kaboom');
      const closed = { ...empty };
      const errorStub = sinon.stub(closed, 'error');
      reportError(error, closed);
      expect(errorStub).to.have.property('called', false);
      expect(consoleStub).to.have.property('called', true);
    } finally {
      consoleStub.restore();
    }
  });

  it('should not report errors an observer with a stopped destination', () => {
    const consoleStub = sinon.stub(console, 'warn');
    try {
      const error = new Error('kaboom');
      const destination = new Subscriber(noop);
      const subscriber = new Subscriber(destination);
      destination.error(error);
      const errorStub = sinon.stub(subscriber, 'error');
      reportError(error, subscriber);
      expect(errorStub).to.have.property('called', false);
      expect(consoleStub).to.have.property('called', true);
    } finally {
      consoleStub.restore();
    }
  });
});
