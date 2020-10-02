/** @prettier */

import { config } from '../src/internal/config';
import { expect } from 'chai';
import { Observable } from 'rxjs';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';

describe('config', () => {
  it('should have a Promise property that defaults to nothing', () => {
    expect(config).to.have.property('Promise');
    expect(config.Promise).to.be.undefined;
  });

  describe('onUnhandledError', () => {
    afterEach(() => {
      config.onUnhandledError = null;
    });

    it('should default to null', () => {
      expect(config.onUnhandledError).to.be.null;
    });

    it('should call asynchronously if an error is emitted and not handled by the consumer observer', (done) => {
      let called = false;
      const results: any[] = [];

      config.onUnhandledError = (err) => {
        called = true;
        expect(err).to.equal('bad');
        done();
      };

      const source = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.error('bad');
      });

      source.subscribe({
        next: (value) => results.push(value),
      });
      expect(called).to.be.false;
      expect(results).to.deep.equal([1]);
    });

    it('should call asynchronously if an error is emitted and not handled by the consumer next callback', (done) => {
      let called = false;
      const results: any[] = [];

      config.onUnhandledError = (err) => {
        called = true;
        expect(err).to.equal('bad');
        done();
      };

      const source = new Observable<number>((subscriber) => {
        subscriber.next(1);
        subscriber.error('bad');
      });

      source.subscribe((value) => results.push(value));
      expect(called).to.be.false;
      expect(results).to.deep.equal([1]);
    });

    it('should call asynchronously if an error is emitted and not handled by the consumer in the empty case', (done) => {
      let called = false;
      config.onUnhandledError = (err) => {
        called = true;
        expect(err).to.equal('bad');
        done();
      };

      const source = new Observable((subscriber) => {
        subscriber.error('bad');
      });

      source.subscribe();
      expect(called).to.be.false;
    });

    /**
     * This test is added so people know this behavior is _intentional_. It's part of the contract of observables
     * and, while I'm not sure I like it, it might start surfacing untold numbers of errors, and break
     * node applications if we suddenly changed this to start throwing errors on other jobs for instances
     * where users accidentally called `subscriber.error` twice. Likewise, would we report an error
     * for two calls of `complete`? This is really something a build-time tool like a linter should
     * capture. Not a run time error reporting event.
     */
    it('should not be called if two errors are sent to the subscriber', (done) => {
      let called = false;
      config.onUnhandledError = () => {
        called = true;
      };

      const source = new Observable((subscriber) => {
        subscriber.error('handled');
        subscriber.error('swallowed');
      });

      let syncSentError: any;
      source.subscribe({
        error: (err) => {
          syncSentError = err;
        },
      });

      expect(syncSentError).to.equal('handled');
      // When called, onUnhandledError is called on a timeout, so delay the
      // the assertion of the expectation until after the point at which
      // onUnhandledError would have been called.
      timeoutProvider.setTimeout(() => {
        expect(called).to.be.false;
        done();
      });
    });
  });

  describe('onStoppedNotification', () => {
    afterEach(() => {
      config.onStoppedNotification = null;
    });

    it('should default to null', () => {
      expect(config.onStoppedNotification).to.be.null;
    });

    it('should be called asynchronously if a subscription setup errors after the subscription is closed by an error', (done) => {
      let called = false;
      config.onStoppedNotification = (notification) => {
        called = true;
        expect(notification.kind).to.equal('E');
        expect(notification).to.have.property('error', 'bad');
        done();
      };

      const source = new Observable((subscriber) => {
        subscriber.error('handled');
        throw 'bad';
      });

      let syncSentError: any;
      source.subscribe({
        error: (err) => {
          syncSentError = err;
        },
      });

      expect(syncSentError).to.equal('handled');
      expect(called).to.be.false;
    });

    it('should be called asynchronously if a subscription setup errors after the subscription is closed by a completion', (done) => {
      let called = false;
      let completed = false;
      config.onStoppedNotification = (notification) => {
        called = true;
        expect(notification.kind).to.equal('E');
        expect(notification).to.have.property('error', 'bad');
        done();
      };

      const source = new Observable((subscriber) => {
        subscriber.complete();
        throw 'bad';
      });

      source.subscribe({
        error: () => {
          throw 'should not be called';
        },
        complete: () => {
          completed = true;
        },
      });

      expect(completed).to.be.true;
      expect(called).to.be.false;
    });

    it('should be called if a next is sent to the stopped subscriber', (done) => {
      let called = false;
      config.onStoppedNotification = (notification) => {
        called = true;
        expect(notification.kind).to.equal('N');
        expect(notification).to.have.property('value', 2);
        done();
      };

      const source = new Observable((subscriber) => {
        subscriber.next(1);
        subscriber.complete();
        subscriber.next(2);
      });

      let syncSentValue: any;
      source.subscribe({
        next: (value) => {
          syncSentValue = value;
        },
      });

      expect(syncSentValue).to.equal(1);
      expect(called).to.be.false;
    });

    it('should be called if two errors are sent to the subscriber', (done) => {
      let called = false;
      config.onStoppedNotification = (notification) => {
        called = true;
        expect(notification.kind).to.equal('E');
        expect(notification).to.have.property('error', 'swallowed');
        done();
      };

      const source = new Observable((subscriber) => {
        subscriber.error('handled');
        subscriber.error('swallowed');
      });

      let syncSentError: any;
      source.subscribe({
        error: (err) => {
          syncSentError = err;
        },
      });

      expect(syncSentError).to.equal('handled');
      expect(called).to.be.false;
    });

    it('should be called if two completes are sent to the subscriber', (done) => {
      let called = false;
      config.onStoppedNotification = (notification) => {
        called = true;
        expect(notification.kind).to.equal('C');
        done();
      };

      const source = new Observable((subscriber) => {
        subscriber.complete();
        subscriber.complete();
      });

      source.subscribe();

      expect(called).to.be.false;
    });
  });
});
