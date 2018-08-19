import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { concat, defer, Observable, of, Subject } from 'rxjs';
import { skipUntil, mergeMap } from 'rxjs/operators';

declare function asDiagram(arg: string): Function;

/** @test {skipUntil} */
describe('skipUntil', () => {
  asDiagram('skipUntil')('should skip values until another observable notifies', () => {
    const e1 =     hot('--a--b--c--d--e----|');
    const e1subs =     '^                  !';
    const skip =   hot('---------x------|   ');
    const skipSubs =   '^        !          ';
    const expected =  ('-----------d--e----|');

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should emit elements after notifer emits', () => {
    const e1 =     hot('--a--b--c--d--e--|');
    const e1subs =     '^                !';
    const skip =   hot('---------x----|   ');
    const skipSubs =   '^        !        ';
    const expected =  ('-----------d--e--|');

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should emit elements after a synchronous notifier emits', () => {
    const values: string[] = [];

    of('a', 'b').pipe(skipUntil(of('x'))).subscribe(
      value => values.push(value),
      err => { throw err; },
      () => expect(values).to.deep.equal(['a', 'b'])
    );
  });

  it('should raise an error if notifier throws and source is hot', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^            !    ';
    const skip = hot('-------------#    ');
    const skipSubs = '^            !    ';
    const expected = '-------------#    ';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all elements when notifier does not emit and completes early', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = hot('------------|');
    const skipSubs = '^           !';
    const expected = '-----------------|';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =     hot('--a--b--c--d--e----|');
    const unsub =      '         !          ';
    const e1subs =     '^        !          ';
    const skip =   hot('-------------x--|   ');
    const skipSubs =   '^        !          ';
    const expected =  ('----------          ');

    expectObservable(e1.pipe(skipUntil(skip)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =     hot('--a--b--c--d--e----|');
    const e1subs =     '^        !          ';
    const skip =   hot('-------------x--|   ');
    const skipSubs =   '^        !          ';
    const expected =  ('----------          ');
    const unsub =      '         !          ';

    const result = e1.pipe(
      mergeMap(x => of(x)),
      skipUntil(skip),
      mergeMap(x => of(x)),
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all elements when notifier is empty', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = cold('|');
    const skipSubs = '(^!)';
    const expected = '-----------------|';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should keep subscription to source, to wait for its eventual completion', () => {
    const e1 =   hot('------------------------------|');
    const e1subs =   '^                             !';
    const skip = hot('-------|                       ');
    const skipSubs = '^      !                       ';
    const expected = '------------------------------|';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not complete if hot source observable does not complete', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const skip = hot('-------------x--|');
    const skipSubs = '^            !   ';
    const expected = '-';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not complete if cold source observable never completes', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const skip = hot('-------------x--|');
    const skipSubs = '^            !   ';
    const expected = '-';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should raise error if cold source is never and notifier errors', () => {
    const e1 = cold( '-');
    const e1subs =   '^            !';
    const skip = hot('-------------#');
    const skipSubs = '^            !';
    const expected = '-------------#';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all elements and complete if notifier is cold never', () => {
    const e1 =   hot( '--a--b--c--d--e--|');
    const e1subs =    '^                !';
    const skip = cold('-');
    const skipSubs =  '^                !';
    const expected =  '-----------------|';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all elements and complete if notifier is a hot never', () => {
    const e1 =   hot('--a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = hot('-');
    const skipSubs = '^                !';
    const expected = '-----------------|';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip all elements and complete, even if notifier would not complete until later', () => {
    const e1 =   hot('^-a--b--c--d--e--|');
    const e1subs =   '^                !';
    const skip = hot('^-----------------------|');
    const skipSubs = '^                !';
    const expected = '-----------------|';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not complete if source does not complete if notifier completes without emission', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const skip = hot('--------------|');
    const skipSubs = '^             !';
    const expected = '-';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should not complete if source and notifier are both hot never', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const skip = hot('-');
    const skipSubs = '^';
    const expected = '-';

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(skip.subscriptions).toBe(skipSubs);
  });

  it('should skip skip all elements if notifier is unsubscribed explicitly before the notifier emits', () => {
    const e1 =   hot( '--a--b--c--d--e--|');
    const e1subs =   ['^                !',
                      '^                !']; // for the explicit subscribe some lines below
    const skip = new Subject();
    const expected =  '-----------------|';

    e1.subscribe((x: string) => {
      if (x === 'd' && !skip.closed) {
        skip.next('x');
      }

      skip.unsubscribe();
    });

    expectObservable(e1.pipe(skipUntil(skip))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should unsubscribe the notifier after its first nexted value', () => {
    const source =   hot('-^-o---o---o---o---o---o---|');
    const notifier = hot('-^--------n--n--n--n--n--n-|');
    const nSubs =         '^        !';
    const expected =     '-^---------o---o---o---o---|';
    const result = source.pipe(skipUntil(notifier));

    expectObservable(result).toBe(expected);
    expectSubscriptions(notifier.subscriptions).toBe(nSubs);
  });

  it('should stop listening to a synchronous notifier after its first nexted value', () => {
    // const source =   hot('-^-o---o---o---o---o---o---|');
    const sideEffects: number[] = [];
    const synchronousNotifer = concat(
      defer(() => {
        sideEffects.push(1);
        return of(1);
      }),
      defer(() => {
        sideEffects.push(2);
        return of(2);
      }),
      defer(() => {
        sideEffects.push(3);
        return of(3);
      })
    );
    of(null).pipe(skipUntil(synchronousNotifer)).subscribe(() => { /* noop */ });
    expect(sideEffects).to.deep.equal([1]);
  });
});
