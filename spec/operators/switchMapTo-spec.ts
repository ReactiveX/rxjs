import { expect } from 'chai';
import * as Rx from '../../src/internal/Rx';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

const Observable = Rx.Observable;

/** @test {switchMapTo} */
describe('Observable.prototype.switchMapTo', () => {
  asDiagram('switchMapTo( 10\u2014\u201410\u2014\u201410\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-x-xx-x-x---|';
    const values = {x: 10};

    const result = e1.switchMapTo(e2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch a synchronous many outer to a synchronous many inner', (done) => {
    const a = Observable.of(1, 2, 3);
    const expected = ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b', 'c'];
    a.switchMapTo(Observable.of('a', 'b', 'c')).subscribe((x) => {
      expect(x).to.equal(expected.shift());
    }, null, done);
  });

  it('should unsub inner observables', () => {
    let unsubbed = 0;

    Observable.of('a', 'b').switchMapTo(
      new Observable<string>((subscriber) => {
        subscriber.complete();
        return () => {
          unsubbed++;
        };
      })
    ).subscribe();

    expect(unsubbed).to.equal(2);
  });

  it('should switch to an inner cold observable', () => {
    const x =   cold(         '--a--b--c--d--e--|          ');
    const xsubs =   ['         ^         !                 ',
    //                                 --a--b--c--d--e--|
                   '                   ^                !'];
    const e1 =   hot('---------x---------x---------|       ');
    const e1subs =   '^                                   !';
    const expected = '-----------a--b--c---a--b--c--d--e--|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, outer eventually throws', () => {
    const x =   cold(         '--a--b--c--d--e--|');
    const xsubs =    '         ^         !       ';
    const e1 =   hot('---------x---------#       ');
    const e1subs =   '^                  !       ';
    const expected = '-----------a--b--c-#       ';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, outer is unsubscribed early', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =   ['         ^         !          ',
    //                                 --a--b--c--d--e--|
                   '                   ^  !       '];
    const e1 =   hot('---------x---------x---------|');
    const unsub =    '                      !       ';
    const e1subs =   '^                     !       ';
    const expected = '-----------a--b--c---a-       ';

    expectObservable(e1.switchMapTo(x), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =   ['         ^         !          ',
    //                                 --a--b--c--d--e--|
                   '                   ^  !       '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                     !       ';
    const expected = '-----------a--b--c---a-       ';
    const unsub =    '                      !       ';

    const result = e1
      .mergeMap((x) => Observable.of(x))
      .switchMapTo(x)
      .mergeMap((x) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, inner never completes', () => {
    const x =   cold(         '--a--b--c--d--e-          ');
    const xsubs =   ['         ^         !               ',
    //                                 --a--b--c--d--e-
                   '                   ^               '];
    const e1 =   hot('---------x---------y---------|     ');
    const e1subs =   '^                                  ';
    const expected = '-----------a--b--c---a--b--c--d--e-';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch to the inner observable', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =   ['         (^!)                 ',
                   '         ^                !   '];
    const e1 =   hot('---------(xx)----------------|');
    const e1subs =   '^                            !';
    const expected = '-----------a--b--c--d--e-----|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner cold observable, inner raises an error', () => {
    const x =   cold(         '--a--b--#            ');
    const xsubs =    '         ^       !            ';
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                !            ';
    const expected = '-----------a--b--#            ';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch an inner hot observable', () => {
    const x =    hot('--p-o-o-p---a--b--c--d-|      ');
    const xsubs =   ['         ^         !          ',
                   '                   ^   !      '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                            !';
    const expected = '------------a--b--c--d-------|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner empty', () => {
    const x = cold('|');
    const xsubs =   ['         (^!)                 ',
                   '                   (^!)       '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                            !';
    const expected = '-----------------------------|';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner never', () => {
    const x = cold('-');
    const xsubs =   ['         ^         !          ',
                   '                   ^          '];
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^                             ';
    const expected = '------------------------------';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch to an inner that just raises an error', () => {
    const x = cold('#');
    const xsubs =    '         (^!)                 ';
    const e1 =   hot('---------x---------x---------|');
    const e1subs =   '^        !                    ';
    const expected = '---------#                    ';

    expectObservable(e1.switchMapTo(x)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an empty outer', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.switchMapTo(Observable.of('foo'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never outer', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.switchMapTo(Observable.of('foo'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an outer that just raises and error', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.switchMapTo(Observable.of('foo'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
