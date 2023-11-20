/** @prettier */
import { expect } from 'chai';
import * as sinon from 'sinon';

import { fromEventPattern, noop, NEVER, timer } from 'rxjs';
import { mapTo, take, concatWith } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {fromEventPattern} */
describe('fromEventPattern', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should create an observable from the handler API', () => {
    rxTestScheduler.run(({ time, expectObservable }) => {
      const time1 = time('-----|     ');
      const time2 = time('     --|   ');
      const expected = '  -----x-x---';

      function addHandler(h: any) {
        timer(time1, time2, rxTestScheduler).pipe(mapTo('ev'), take(2), concatWith(NEVER)).subscribe(h);
      }
      const e1 = fromEventPattern(addHandler);

      expectObservable(e1).toBe(expected, { x: 'ev' });
    });
  });

  it('should call addHandler on subscription', () => {
    const addHandler = sinon.spy();
    fromEventPattern(addHandler, noop).subscribe(noop);

    const call = addHandler.getCall(0);
    expect(addHandler).calledOnce;
    expect(call.args[0]).to.be.a('function');
  });

  it('should call removeHandler on unsubscription', () => {
    const removeHandler = sinon.spy();

    fromEventPattern(noop, removeHandler).subscribe(noop).unsubscribe();

    const call = removeHandler.getCall(0);
    expect(removeHandler).calledOnce;
    expect(call.args[0]).to.be.a('function');
  });

  it('should work without optional removeHandler', () => {
    const addHandler: (h: () => any) => any = sinon.spy();
    fromEventPattern(addHandler).subscribe(noop);

    expect(addHandler).calledOnce;
  });

  it('should deliver return value of addHandler to removeHandler as signal', () => {
    const expected = { signal: true };
    const addHandler = () => expected;
    const removeHandler = sinon.spy();
    fromEventPattern(addHandler, removeHandler).subscribe(noop).unsubscribe();

    const call = removeHandler.getCall(0);
    expect(call).calledWith(sinon.match.any, expected);
  });

  it('should send errors in addHandler down the error path', (done) => {
    fromEventPattern((h: any) => {
      throw 'bad';
    }, noop).subscribe({
      next: () => done(new Error('should not be called')),
      error: (err: any) => {
        expect(err).to.equal('bad');
        done();
      },
      complete: () => done(new Error('should not be called')),
    });
  });

  it('should accept a selector that maps outgoing values', (done) => {
    let target: any;
    const trigger = function (...args: any[]) {
      if (target) {
        // eslint-disable-next-line prefer-spread
        target.apply(null, args);
      }
    };

    const addHandler = (handler: any) => {
      target = handler;
    };
    const removeHandler = (handler: any) => {
      target = null;
    };
    const selector = (a: any, b: any) => {
      return a + b + '!';
    };

    fromEventPattern(addHandler, removeHandler, selector)
      .pipe(take(1))
      .subscribe({
        next: (x: any) => {
          expect(x).to.equal('testme!');
        },
        error: (err: any) => {
          done(new Error('should not be called'));
        },
        complete: () => {
          done();
        },
      });

    trigger('test', 'me');
  });

  it('should send errors in the selector down the error path', (done) => {
    let target: any;
    const trigger = (value: any) => {
      if (target) {
        target(value);
      }
    };

    const addHandler = (handler: any) => {
      target = handler;
    };
    const removeHandler = (handler: any) => {
      target = null;
    };
    const selector = (x: any) => {
      throw 'bad';
    };

    fromEventPattern(addHandler, removeHandler, selector).subscribe({
      next: (x: any) => {
        done(new Error('should not be called'));
      },
      error: (err: any) => {
        expect(err).to.equal('bad');
        done();
      },
      complete: () => {
        done(new Error('should not be called'));
      },
    });

    trigger('test');
  });
});
