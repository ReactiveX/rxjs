import * as Rx from '../../dist/cjs/Rx';
import { expect } from 'chai';

import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {sample} */
describe('Observable.prototype.sample', () => {
  asDiagram('sample')('should get samples when the notifier emits', () => {
    const e1 =   hot('---a----b---c----------d-----|   ');
    const e1subs =   '^                            !   ';
    const e2 =   hot('-----x----------x---x------x---|');
    const e2subs =   '^                            !   ';
    const expected = '-----a----------c----------d-|   ';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should sample nothing if source has not nexted at all', () => {
    const e1 =   hot('----a-^------------|');
    const e1subs =         '^            !';
    const e2 =   hot(      '-----x-------|');
    const e2subs =         '^            !';
    const expected =       '-------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should behave properly when notified by the same observable as the source (issue #2075)', () => {
    const item$ = new Rx.Subject();
    const results = [];

    item$
      .sample(item$)
      .subscribe(value => results.push(value));

    item$.next(1);
    item$.next(2);
    item$.next(3);

    expect(results).to.deep.equal([1, 2, 3]);
  });

  it('should sample nothing if source has nexted after all notifications, but notifier does not complete', () => {
    const e1 =   hot('----a-^------b-----|');
    const e1subs =         '^            !';
    const e2 =   hot(      '-----x--------');
    const e2subs =         '^            !';
    const expected =       '-------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should sample when the notifier completes', () => {
    const e1 =   hot('----a-^------b----------|');
    const e1subs =         '^                 !';
    const e2 =   hot(      '-----x-----|');
    const e2subs =         '^          !';
    const expected =       '-----------b------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete when the notifier completes, nor should it emit', () => {
    const e1 =   hot('----a----b----c----d----e----f----');
    const e1subs =   '^                                 ';
    const e2 =   hot('------x-|                         ');
    const e2subs =   '^       !                         ';
    const expected = '------a---------------------------';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete only when the source completes, if notifier completes early', () => {
    const e1 =   hot('----a----b----c----d----e----f---|');
    const e1subs =   '^                                !';
    const e2 =   hot('------x-|                         ');
    const e2subs =   '^       !                         ';
    const expected = '------a--------------------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('----a-^--b----c----d----e----f----|          ');
    const unsub =          '              !                        ';
    const e1subs =         '^             !                        ';
    const e2 =   hot(      '-----x----------x----------x----------|');
    const e2subs =         '^             !                        ';
    const expected =       '-----b---------                        ';

    expectObservable(e1.sample(e2), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('----a-^--b----c----d----e----f----|          ');
    const e1subs =         '^             !                        ';
    const e2 =   hot(      '-----x----------x----------x----------|');
    const e2subs =         '^             !                        ';
    const expected =       '-----b---------                        ';
    const unsub =          '              !                        ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .sample(e2)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should only sample when a new value arrives, even if it is the same value', () => {
    const e1 =   hot('----a----b----c----c----e----f----|  ');
    const e1subs =   '^                                 !  ';
    const e2 =   hot('------x-x------xx-x---x----x--------|');
    const e2subs =   '^                                 !  ';
    const expected = '------a--------c------c----e------|  ';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source raises error', () => {
    const e1 =   hot('----a-^--b----c----d----#                    ');
    const e1subs =         '^                 !                    ';
    const e2 =   hot(      '-----x----------x----------x----------|');
    const e2subs =         '^                 !                    ';
    const expected =       '-----b----------d-#                    ';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should completes if source does not emits', () => {
    const e1 =   hot('|');
    const e2 =   hot('------x-------|');
    const expected = '|';
    const e1subs =   '(^!)';
    const e2subs =   '(^!)';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if source throws immediately', () => {
    const e1 =   hot('#');
    const e2 =   hot('------x-------|');
    const expected = '#';
    const e1subs =   '(^!)';
    const e2subs =   '(^!)';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if notification raises error', () => {
    const e1 =   hot('--a-----|');
    const e2 =   hot('----#');
    const expected = '----#';
    const e1subs =   '^   !';
    const e2subs =   '^   !';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not completes if source does not complete', () => {
    const e1 =   hot('-');
    const e1subs =   '^              ';
    const e2 =   hot('------x-------|');
    const e2subs =   '^             !';
    const expected = '-';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should sample only until source completes', () => {
    const e1 =   hot('----a----b----c----d-|');
    const e1subs =   '^                    !';
    const e2 =   hot('-----------x----------x------------|');
    const e2subs =   '^                    !';
    const expected = '-----------b---------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should complete sampling if sample observable completes', () => {
    const e1 =   hot('----a----b----c----d-|');
    const e1subs =   '^                    !';
    const e2 =   hot('|');
    const e2subs =   '(^!)';
    const expected = '---------------------|';

    expectObservable(e1.sample(e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});