import { expect } from 'chai';
import { lowerCaseO } from '../helpers/test-helper';
import { hot, cold, emptySubs, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { asyncScheduler, queueScheduler as rxQueueScheduler, concat, of, defer, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const queueScheduler = rxQueueScheduler;

/** @test {concat} */
describe('static concat', () => {
  it('should emit elements from multiple sources', () => {
    const e1 =  cold('-a-b-c-|');
    const e1subs =   '^      !';
    const e2 =  cold('-0-1-|');
    const e2subs =   '       ^    !';
    const e3 =  cold('-w-x-y-z-|');
    const e3subs =   '            ^        !';
    const expected = '-a-b-c--0-1--w-x-y-z-|';

    expectObservable(concat(e1, e2, e3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should concat the same cold observable multiple times', () => {
    const inner =  cold('--i-j-k-l-|                              ');
    const innersubs =  ['^         !                              ',
                      '          ^         !                    ',
                      '                    ^         !          ',
                      '                              ^         !'];
    const expected =    '--i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

    const result = concat(inner, inner, inner, inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concat the same cold observable multiple times, ' +
  'but the result is unsubscribed early', () => {
    const inner =  cold('--i-j-k-l-|     ');
    const unsub =       '               !';
    const innersubs =  ['^         !     ',
                      '          ^    !'];
    const expected =    '--i-j-k-l---i-j-';

    const result = concat(inner, inner, inner, inner);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const inner =  cold('--i-j-k-l-|     ');
    const innersubs =  ['^         !     ',
                      '          ^    !'];
    const expected =    '--i-j-k-l---i-j-';
    const unsub =       '               !';

    const innerWrapped = inner.pipe(
      mergeMap((x) => of(x))
    );
    const result = concat(innerWrapped, innerWrapped, innerWrapped, innerWrapped)
      .pipe(mergeMap((x) => of(x)));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should complete without emit if both sources are empty', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '----|');
    const e2subs =    '  ^   !';
    const expected =  '------|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not completes', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('--|');
    const e2subs = emptySubs;
    const expected =  '-';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if second source does not completes', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold('---');
    const e2subs =    '  ^';
    const expected =  '---';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if both sources do not complete', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('-');
    const e2subs = emptySubs;
    const expected =  '-';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source is empty, second source raises error', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '----#');
    const e2subs =    '  ^   !';
    const expected =  '------#';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source raises error, second source is empty', () => {
    const e1 =   cold('---#');
    const e1subs =    '^  !';
    const e2 =   cold('----|');
    const e2subs = emptySubs;
    const expected =  '---#';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise first error when both source raise error', () => {
    const e1 =   cold('---#');
    const e1subs =    '^  !';
    const e2 =   cold('------#');
    const e2subs = emptySubs;
    const expected =  '---#';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source emits once, second source is empty', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '--------|');
    const e2subs =    '     ^       !';
    const expected =  '--a----------|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source is empty, second source emits once', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '--a--|');
    const e2subs =    '  ^    !';
    const expected =  '----a--|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source, and should not complete if second ' +
  'source does not completes', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '-');
    const e2subs =    '     ^';
    const expected =  '--a---';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not complete', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('--a--|');
    const e2subs = emptySubs;
    const expected =  '-';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from each source when source emit once', () => {
    const e1 =   cold('---a|');
    const e1subs =    '^   !';
    const e2 =   cold(    '-----b--|');
    const e2subs =    '    ^       !';
    const expected =  '---a-----b--|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe to inner source if outer is unsubscribed early', () => {
    const e1 =   cold('---a-a--a|            ');
    const e1subs =    '^        !            ';
    const e2 =   cold(         '-----b-b--b-|');
    const e2subs =    '         ^       !    ';
    const unsub =     '                 !    ';
    const expected =  '---a-a--a-----b-b     ';

    expectObservable(concat(e1, e2), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error from first source and does not emit from second source', () => {
    const e1 =   cold('--#');
    const e1subs =    '^ !';
    const e2 =   cold('----a--|');
    const e2subs = emptySubs;
    const expected =  '--#';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source then raise error from second source', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '-------#');
    const e2subs =    '     ^      !';
    const expected =  '--a---------#';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit all elements from both hot observable sources if first source ' +
  'completes before second source starts emit', () => {
    const e1 =   hot('--a--b-|');
    const e1subs =   '^      !';
    const e2 =   hot('--------x--y--|');
    const e2subs =   '       ^      !';
    const expected = '--a--b--x--y--|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from second source regardless of completion time ' +
  'when second source is cold observable', () => {
    const e1 =   hot('--a--b--c---|');
    const e1subs =   '^           !';
    const e2 =  cold('-x-y-z-|');
    const e2subs =   '            ^      !';
    const expected = '--a--b--c----x-y-z-|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not emit collapsing element from second source', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^          !';
    const e2 =   hot('--------x--y--z--|');
    const e2subs =   '           ^     !';
    const expected = '--a--b--c--y--z--|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should return empty if concatenating an empty source', () => {
    const e1 =  cold('|');
    const e1subs =  ['(^!)', '(^!)'];
    const expected = '|';

    const result = concat(e1, e1);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error immediately if given a just-throw source', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const expected = '#';

    const result = concat(e1, e1);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit elements from second source regardless of completion time ' +
  'when second source is cold observable', () => {
    const e1 =   hot('--a--b--c---|');
    const e1subs =   '^           !';
    const e2 =  cold('-x-y-z-|');
    const e2subs =   '            ^      !';
    const expected = '--a--b--c----x-y-z-|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not emit collapsing element from second source', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^          !';
    const e2 =   hot('--------x--y--z--|');
    const e2subs =   '           ^     !';
    const expected = '--a--b--c--y--z--|';

    expectObservable(concat(e1, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat an immediately-scheduled source with an immediately-scheduled second', (done) => {
    const a = of<number>(1, 2, 3, queueScheduler);
    const b = of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [1, 2, 3, 4, 5, 6, 7, 8];

    concat(a, b, queueScheduler).subscribe((vals) => {
      expect(vals).to.equal(r.shift());
    }, null, done);
  });

  it('should use the scheduler even when one Observable is concat\'d', (done) => {
    let e1Subscribed = false;
    const e1 = defer(() => {
      e1Subscribed = true;
      return of('a');
    });

    concat(e1, asyncScheduler)
      .subscribe({
        error: done,
        complete: () => {
          expect(e1Subscribed).to.be.true;
          done();
        }
      });

    expect(e1Subscribed).to.be.false;
  });

  it('should return passed observable if no scheduler was passed', () => {
    const source = cold('--a---b----c---|');
    const result = concat(source);

    expectObservable(result).toBe('--a---b----c---|');
  });

  it('should return RxJS Observable when single lowerCaseO was passed', () => {
    const source = lowerCaseO('a', 'b', 'c');
    const result = concat(source);

    expect(result).to.be.an.instanceof(Observable);
    expectObservable(result).toBe('(abc|)');
  });
});
