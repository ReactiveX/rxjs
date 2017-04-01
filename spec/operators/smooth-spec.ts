import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

/** @test {smooth} */
describe('Observable.prototype.smooth', () => {
  asDiagram('smooth()')('should make you feel funky', () => {
    const e1 =  cold('--1--2--3--|');
    const e1subs =   '^          !';
    const expected = '--1--2--3--|';

    const result = e1.smooth();
    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
