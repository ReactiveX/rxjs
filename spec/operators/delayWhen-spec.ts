import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports
import { expect } from 'chai';

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
declare const rxTestScheduler: Rx.TestScheduler;

/** @test {delayWhen} */
describe('Observable.prototype.delayWhen', () => {
  asDiagram('delayWhen(durationSelector)')('should delay by duration selector', () => {
    const e1 =        hot('---a---b---c--|');
    const expected =      '-----a------c----(b|)';
    const subs =          '^                !';
    const selector = [cold(  '--x--|'),
                      cold(      '----------(x|)'),
                      cold(          '-x--|')];
    const selectorSubs = ['   ^ !            ',
                          '       ^         !',
                          '           ^!     '];

    let idx = 0;
    function durationSelector(x) {
      return selector[idx++];
    }

    const result = e1.delayWhen(durationSelector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector[0].subscriptions).toBe(selectorSubs[0]);
    expectSubscriptions(selector[1].subscriptions).toBe(selectorSubs[1]);
    expectSubscriptions(selector[2].subscriptions).toBe(selectorSubs[2]);
  });

  it('should delay by selector', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '---a--b-|';
    const subs =          '^       !';
    const selector = cold(  '-x--|');
    const selectorSubs = ['  ^!     ',
                        '     ^!  '];

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should raise error if source raises error', () => {
    const e1 =        hot('--a--#');
    const expected =      '---a-#';
    const subs =          '^    !';
    const selector = cold(  '-x--|');
    const selectorSubs =  '  ^!     ';

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should raise error if selector raises error', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '---#';
    const subs =          '^  !';
    const selector = cold(  '-#');
    const selectorSubs =  '  ^!     ';

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by selector and completes after value emits', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '---------a--(b|)';
    const subs =          '^           !';
    const selector = cold('-------x--|');
    const selectorSubs = ['  ^      !',
                        '     ^      !'];

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by selector completes if selector does not emits', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '------a--(b|)';
    const subs =          '^        !';
    const selector = cold(  '----|');
    const selectorSubs = ['  ^   !',
                        '     ^   !'];

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should not emit if selector never emits', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '-';
    const subs =          '^         ';
    const selector = cold(  '-');
    const selectorSubs = ['  ^       ',
                        '     ^    '];

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by first value from selector', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '------a--(b|)';
    const subs =          '^        !';
    const selector = cold(  '----x--y--|');
    const selectorSubs = ['  ^   !',
                        '     ^   !'];

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should delay by selector does not completes', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '------a--(b|)';
    const subs =          '^        !';
    const selector = cold(  '----x-----y---');
    const selectorSubs = ['  ^   !',
                        '     ^   !'];

    const result = e1.delayWhen((x: any) => selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
  });

  it('should raise error if selector throws', () => {
    const e1 =        hot('--a--b--|');
    const expected =      '--#';
    const subs =          '^ !';

    const err = new Error('error');
    const result = e1.delayWhen(<any>((x: any) => { throw err; }));

    expectObservable(result).toBe(expected, null, err);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should start subscription when subscription delay emits', () => {
    const e1 =        hot('-----a---b---|');
    const expected =      '  -----a---b-|';
    const subs =          '  ^          !';
    const selector = cold(     '--x--|');
    const selectorSubs = ['     ^ !',
                        '         ^ !'];
    const subDelay = cold('--x--|');
    const subDelaySub =   '^ !';

    const result = e1.delayWhen((x: any) => selector, subDelay);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
  });

  it('should start subscription when subscription delay completes without emit value', () => {
    const e1 =        hot('-----a---b---|');
    const expected =      '  -----a---b-|';
    const subs =          '  ^          !';
    const selector = cold(     '--x--|');
    const selectorSubs = ['     ^ !',
                        '         ^ !'];
    const subDelay = cold('--|');
    const subDelaySub =   '^ !';

    const result = e1.delayWhen((x: any) => selector, subDelay);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(selector.subscriptions).toBe(selectorSubs);
    expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
  });

  it('should raise error when subscription delay raises error', () => {
    const e1 =        hot('-----a---b---|');
    const expected =      '   #          ';
    const selector = cold(     '--x--|');
    const subDelay = cold('---#');
    const subDelaySub =   '^  !';

    const result = e1.delayWhen((x: any) => selector, subDelay);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe([]);
    expectSubscriptions(selector.subscriptions).toBe([]);
    expectSubscriptions(subDelay.subscriptions).toBe(subDelaySub);
  });

  it('should complete when duration selector returns synchronous observable', () => {
    let next: boolean = false;
    let complete: boolean = false;

    Rx.Observable.of(1)
      .delayWhen(() => Rx.Observable.of(2))
      .subscribe(() => next = true, null, () => complete = true);

    expect(next).to.be.true;
    expect(complete).to.be.true;
  });
});