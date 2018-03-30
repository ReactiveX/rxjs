import { expect } from 'chai';
import * as sinon from 'sinon';
import { expectObservable } from '../helpers/marble-testing';

import { fromEventPattern, noop, NEVER, timer } from 'rxjs';
import { mapTo, take, concat } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

/** @test {fromEventPattern} */
describe('fromEventPattern', () => {
  asDiagram('fromEventPattern(addHandler, removeHandler)')
  ('should create an observable from the handler API', () => {
    function addHandler(h: any) {
      timer(50, 20, rxTestScheduler).pipe(
        mapTo('ev'),
        take(2),
        concat(NEVER)
      ).subscribe(h);
    }
    const e1 = fromEventPattern(addHandler);
    const expected = '-----x-x---';
    expectObservable(e1).toBe(expected, {x: 'ev'});
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
    const addHandler: (h: Function) => any = sinon.spy();
    fromEventPattern(addHandler).subscribe(noop);

    expect(addHandler).calledOnce;
  });

  it('should deliver return value of addHandler to removeHandler as signal', () => {
    const expected = { signal: true};
    const addHandler = () => expected;
    const removeHandler = sinon.spy();
    fromEventPattern(addHandler, removeHandler).subscribe(noop).unsubscribe();

    const call = removeHandler.getCall(0);
    expect(call).calledWith(sinon.match.any, expected);
  });

  it('should send errors in addHandler down the error path', (done: MochaDone) => {
    fromEventPattern((h: any) => {
      throw 'bad';
    }, noop).subscribe(
      () => done(new Error('should not be called')),
      (err: any) => {
        expect(err).to.equal('bad');
        done();
      }, () => done(new Error('should not be called')));
  });

  it('should accept a selector that maps outgoing values', (done: MochaDone) => {
    let target: any;
    const trigger = function (...args: any[]) {
      if (target) {
        target.apply(null, arguments);
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

    fromEventPattern(addHandler, removeHandler, selector).pipe(take(1))
      .subscribe((x: any) => {
        expect(x).to.equal('testme!');
      }, (err: any) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });

    trigger('test', 'me');
  });

  it('should send errors in the selector down the error path', (done: MochaDone) => {
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

    fromEventPattern(addHandler, removeHandler, selector)
      .subscribe((x: any) => {
        done(new Error('should not be called'));
      }, (err: any) => {
        expect(err).to.equal('bad');
        done();
      }, () => {
        done(new Error('should not be called'));
      });

    trigger('test');
  });
});
