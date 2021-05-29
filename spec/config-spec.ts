/** @prettier */

import { expect } from 'chai';
import { Observable, config } from 'rxjs';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';
import { createSpiedObserver, withConfigHandlerSpies } from './helpers/test-helper';

describe('config', () => {
  it('should have a Promise property that defaults to nothing', () => {
    expect(config).to.have.property('Promise');
    expect(config.Promise).to.be.undefined;
  });

  describe('onUnhandledError', () => {
    it('should default to null', () => {
      expect(config.onUnhandledError).to.be.null;
    });

    it(
      'should call the handler that was set when the error was emitted',
      withConfigHandlerSpies(({ onUnhandledError, uninstallHandlers, done }) => {
        new Observable((subscriber) => {
          subscriber.error('bad');
        }).subscribe();

        expect(onUnhandledError).to.not.have.been.called;

        uninstallHandlers();

        Promise.resolve().then(() => {
          expect(onUnhandledError).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onUnhandledError).to.have.been.calledOnce;
          expect(onUnhandledError.firstCall).to.have.been.calledWithExactly('bad');

          done();
        });
      })
    );

    it(
      'should call asynchronously if an error is emitted and not handled by the consumer observer',
      withConfigHandlerSpies(({ onUnhandledError, done }) => {
        const observer = createSpiedObserver('next');

        new Observable((subscriber) => {
          subscriber.next(1);
          subscriber.error('bad');
        }).subscribe(observer);

        expect(observer.next).to.have.been.calledOnce;
        expect(observer.next.firstCall).to.have.been.calledWithExactly(1);

        expect(onUnhandledError).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onUnhandledError).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onUnhandledError).to.have.been.calledOnce;
          expect(onUnhandledError.firstCall).to.have.been.calledWithExactly('bad');

          done();
        });
      })
    );

    it(
      'should call asynchronously if an error is emitted and not handled by the consumer next callback',
      withConfigHandlerSpies(({ onUnhandledError, done }) => {
        const { next } = createSpiedObserver('next');

        new Observable((subscriber) => {
          subscriber.next(1);
          subscriber.error('bad');
        }).subscribe(next);

        expect(next).to.have.been.calledOnce;
        expect(next.firstCall).to.have.been.calledWithExactly(1);

        expect(onUnhandledError).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onUnhandledError).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onUnhandledError).to.have.been.calledOnce;
          expect(onUnhandledError.firstCall).to.have.been.calledWithExactly('bad');

          done();
        });
      })
    );

    it(
      'should call asynchronously if an error is emitted and not handled by the consumer in the empty case',
      withConfigHandlerSpies(({ onUnhandledError, done }) => {
        new Observable((subscriber) => {
          subscriber.error('bad');
        }).subscribe();

        expect(onUnhandledError).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onUnhandledError).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onUnhandledError).to.have.been.calledOnce;
          expect(onUnhandledError.firstCall).to.have.been.calledWithExactly('bad');

          done();
        });
      })
    );

    /**
     * This test is added so people know this behavior is _intentional_. It's part of the contract of observables
     * and, while I'm not sure I like it, it might start surfacing untold numbers of errors, and break
     * node applications if we suddenly changed this to start throwing errors on other jobs for instances
     * where users accidentally called `subscriber.error` twice. Likewise, would we report an error
     * for two calls of `complete`? This is really something a build-time tool like a linter should
     * capture. Not a run time error reporting event.
     */
    it(
      'should not be called if two errors are sent to the subscriber',
      withConfigHandlerSpies(({ onUnhandledError, done }) => {
        const observer = createSpiedObserver();

        new Observable((subscriber) => {
          subscriber.error('handled');
          subscriber.error('swallowed');
        }).subscribe(observer);

        expect(observer.error).to.have.been.calledOnce;
        expect(observer.error.firstCall).to.have.been.calledWithExactly('handled');

        expect(onUnhandledError).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onUnhandledError).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onUnhandledError).to.not.have.been.called;

          done();
        });
      })
    );
  });

  describe('onStoppedNotification', () => {
    it('should default to null', () => {
      expect(config.onStoppedNotification).to.be.null;
    });

    it(
      'should call the handler that was set when the notification was stopped',
      withConfigHandlerSpies(({ onStoppedNotification, uninstallHandlers, done }) => {
        const subscription = new Observable((subscriber) => {
          subscriber.complete();
          subscriber.complete();
        }).subscribe();

        expect(onStoppedNotification).to.not.have.been.called;

        uninstallHandlers();

        Promise.resolve().then(() => {
          expect(onStoppedNotification).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onStoppedNotification).to.have.been.calledOnce;
          expect(onStoppedNotification.firstCall.args.length).to.equal(2);
          // need to use include here because we test against an interface
          expect(onStoppedNotification.firstCall.args[0]).to.include({ kind: 'C' });
          expect(onStoppedNotification.firstCall.args[1]).to.equal(subscription);

          done();
        });
      })
    );

    it(
      'should be called asynchronously if a subscription setup errors after the subscription is closed by an error',
      withConfigHandlerSpies(({ onStoppedNotification, done }) => {
        const observer = createSpiedObserver();

        const subscription = new Observable((subscriber) => {
          subscriber.error('handled');
          throw 'bad';
        }).subscribe(observer);

        expect(observer.error).to.have.been.calledOnce;
        expect(observer.error.firstCall).to.have.been.calledWithExactly('handled');

        expect(onStoppedNotification).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onStoppedNotification).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onStoppedNotification).to.have.been.calledOnce;
          expect(onStoppedNotification.firstCall.args.length).to.equal(2);
          // need to use include here because we test against an interface
          expect(onStoppedNotification.firstCall.args[0]).to.include({ kind: 'E', error: 'bad' });
          expect(onStoppedNotification.firstCall.args[1]).to.equal(subscription);

          done();
        });
      })
    );

    it(
      'should be called asynchronously if a subscription setup errors after the subscription is closed by a completion',
      withConfigHandlerSpies(({ onStoppedNotification, done }) => {
        const observer = createSpiedObserver();

        const subscription = new Observable((subscriber) => {
          subscriber.complete();
          throw 'bad';
        }).subscribe(observer);

        expect(observer.error).to.not.have.been.called;
        expect(observer.complete).to.have.been.calledOnce;

        expect(onStoppedNotification).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onStoppedNotification).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onStoppedNotification).to.have.been.calledOnce;
          expect(onStoppedNotification.firstCall.args.length).to.equal(2);
          // need to use include here because we test against an interface
          expect(onStoppedNotification.firstCall.args[0]).to.include({ kind: 'E', error: 'bad' });
          expect(onStoppedNotification.firstCall.args[1]).to.equal(subscription);

          done();
        });
      })
    );

    it(
      'should be called if a next is sent to the stopped subscriber',
      withConfigHandlerSpies(({ onStoppedNotification, done }) => {
        const observer = createSpiedObserver();

        const subscription = new Observable((subscriber) => {
          subscriber.next(1);
          subscriber.complete();
          subscriber.next(2);
        }).subscribe(observer);

        expect(observer.next).to.have.been.calledOnce;
        expect(observer.next.firstCall).to.have.been.calledWithExactly(1);

        expect(onStoppedNotification).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onStoppedNotification).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onStoppedNotification).to.have.been.calledOnce;
          expect(onStoppedNotification.firstCall.args.length).to.equal(2);
          // need to use include here because we test against an interface
          expect(onStoppedNotification.firstCall.args[0]).to.include({ kind: 'N', value: 2 });
          expect(onStoppedNotification.firstCall.args[1]).to.equal(subscription);

          done();
        });
      })
    );

    it(
      'should be called if two errors are sent to the subscriber',
      withConfigHandlerSpies(({ onStoppedNotification, done }) => {
        const observer = createSpiedObserver();

        const subscription = new Observable((subscriber) => {
          subscriber.error('handled');
          subscriber.error('swallowed');
        }).subscribe(observer);

        expect(observer.error).to.have.been.calledOnce;
        expect(observer.error.firstCall).to.have.been.calledWithExactly('handled');

        expect(onStoppedNotification).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onStoppedNotification).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onStoppedNotification).to.have.been.calledOnce;
          expect(onStoppedNotification.firstCall.args.length).to.equal(2);
          // need to use include here because we test against an interface
          expect(onStoppedNotification.firstCall.args[0]).to.include({ kind: 'E', error: 'swallowed' });
          expect(onStoppedNotification.firstCall.args[1]).to.equal(subscription);

          done();
        });
      })
    );

    it(
      'should be called if two completes are sent to the subscriber',
      withConfigHandlerSpies(({ onStoppedNotification, done }) => {
        const observer = createSpiedObserver();

        const subscription = new Observable((subscriber) => {
          subscriber.complete();
          subscriber.complete();
        }).subscribe(observer);

        expect(observer.complete).to.have.been.calledOnce;

        expect(onStoppedNotification).to.not.have.been.called;

        Promise.resolve().then(() => {
          expect(onStoppedNotification).to.not.have.been.called;
        });

        timeoutProvider.setTimeout(() => {
          expect(onStoppedNotification).to.have.been.calledOnce;
          expect(onStoppedNotification.firstCall.args.length).to.equal(2);
          // need to use include here because we test against an interface
          expect(onStoppedNotification.firstCall.args[0]).to.include({ kind: 'C' });
          expect(onStoppedNotification.firstCall.args[1]).to.equal(subscription);

          done();
        });
      })
    );
  });
});
