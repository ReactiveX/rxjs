import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {auditTime} */
describe('Observable.prototype.auditTime', () => {
  asDiagram('auditTime(50)')('should emit the last value in each time window', () => {
    const e1 =   hot('-a-x-y----b---x-cx---|');
    const subs =     '^                    !';
    const expected = '------y--------x-----|';

    const result = e1.auditTime(50, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should auditTime events by 50 time units', (done: MochaDone) => {
    Observable.of(1, 2, 3)
      .auditTime(50)
      .subscribe((x: number) => {
        done(new Error('should not be called'));
      }, null, () => {
        done();
      });
  });

  it('should auditTime events multiple times', () => {
    const expected = ['1-2', '2-2'];
    Observable.concat(
      Observable.timer(0, 10, rxTestScheduler).take(3).map((x: number) => '1-' + x),
      Observable.timer(80, 10, rxTestScheduler).take(5).map((x: number) => '2-' + x)
      )
      .auditTime(50, rxTestScheduler)
      .subscribe((x: string) => {
        expect(x).to.equal(expected.shift());
      });

    rxTestScheduler.flush();
  });

  it('should delay the source if values are not emitted often enough', () => {
    const e1 =   hot('-a--------b-----c----|');
    const subs =     '^                    !';
    const expected = '------a--------b-----|';

    expectObservable(e1.auditTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const subs =     '^                        !';
    const expected = '-----f-----f-----f-----f-|';

    expectObservable(e1.auditTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';

    expectObservable(e1.auditTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';

    expectObservable(e1.auditTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () => {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';

    expectObservable(e1.auditTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';

    expectObservable(e1.auditTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () => {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';

    expectObservable(e1.auditTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source does not complete', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const unsub =    '                               !';
    const subs =     '^                              !';
    const expected = '------c-------------d-----------';

    expectObservable(e1.auditTime(50, rxTestScheduler), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const subs =     '^                              !';
    const expected = '------c-------------d-----------';
    const unsub =    '                               !';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .auditTime(50, rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should auditTime values until source raises error', () => {
    const e1 =   hot('-a--(bc)-------d---------------#');
    const subs =     '^                              !';
    const expected = '------c-------------d----------#';

    expectObservable(e1.auditTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});
