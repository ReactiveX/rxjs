import { expect } from 'chai';

import { fromEventPattern, noop, NEVER, timer } from 'rxjs';
import { mapTo, take, concatWith } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { assertDeepEquals } from '../test_helpers/assertDeepEquals';

/** @test {fromEventPattern} */
describe('fromEventPattern', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(assertDeepEquals);
  });

  //asDiagram('fromEventPattern(addHandler, removeHandler)')
  it('should create an observable from the handler API', () => {
    testScheduler.run(({ expectObservable }) => {
      function addHandler(handler: any) {
        timer(5, 2, testScheduler).pipe(
          mapTo('ev'),
          take(2),
          concatWith(NEVER)
        ).subscribe(x => handler(x));
      }
      const e1 = fromEventPattern(addHandler);
      const expected = '-----x-x---';
      expectObservable(e1).toBe(expected, {x: 'ev'});
    });
  });

  it('should call addHandler on subscription', () => {
    let addHandlerCalls: any[] = [];

    const addHandler = function () {
      addHandlerCalls.push(Array.from(arguments));
    };
    fromEventPattern(addHandler, noop).subscribe(noop);

    expect(addHandlerCalls.length).to.equal(1);
    expect(addHandlerCalls[0][0]).to.be.a('function');
  });

  it('should call removeHandler on unsubscription', () => {
    let removeHandlerCalls: any[] = [];
    const removeHandler = function() {
      removeHandlerCalls.push(Array.from(arguments));
    }

    fromEventPattern(noop, removeHandler).subscribe(noop).unsubscribe();

    expect(removeHandlerCalls.length).to.equal(1);
    expect(removeHandlerCalls[0][0]).to.be.a('function');
  });

  it('should work without optional removeHandler', () => {
    let addHandlerCalls = 0;
    const addHandler = () => {
      addHandlerCalls++;
    };

    fromEventPattern(addHandler).subscribe(noop);

    expect(addHandlerCalls).to.equal(1);
  });

  it('should deliver return value of addHandler to removeHandler as signal', () => {
    const expected = { signal: true };
    const addHandler = () => expected;
    const removeHandlerCalls: any[] = [];
    const removeHandler = function () {
      removeHandlerCalls.push(Array.from(arguments));
    };

    fromEventPattern(addHandler, removeHandler).subscribe(noop).unsubscribe();

    expect(removeHandlerCalls[0][1]).to.equal(expected);
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
});
