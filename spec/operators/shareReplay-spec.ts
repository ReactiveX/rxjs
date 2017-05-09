import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {shareReplay} */
describe('Observable.prototype.shareReplay', () => {
  it('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const published = source.shareReplay();
    const expected =    '--1-2---3-4--5-|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should do nothing if result is not subscribed', () => {
    let subscribed = false;
    const source = new Observable(() => {
      subscribed = true;
    });
    source.shareReplay();
    expect(subscribed).to.be.false;
  });

  it('should multicast the same values to multiple observers, bufferSize=1', () => {
    const source =     cold('-1-2-3----4-|'); const shared = source.shareReplay(1);
    const sourceSubs =      '^           !';
    const subscriber1 = hot('a|           ').mergeMapTo(shared);
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').mergeMapTo(shared);
    const expected2   =     '    23----4-|';
    const subscriber3 = hot('        c|   ').mergeMapTo(shared);
    const expected3   =     '        3-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers, bufferSize=2', () => {
    const source =     cold('-1-2-----3------4-|'); const shared = source.shareReplay(2);
    const sourceSubs =      '^                 !';
    const subscriber1 = hot('a|                 ').mergeMapTo(shared);
    const expected1   =     '-1-2-----3------4-|';
    const subscriber2 = hot('    b|             ').mergeMapTo(shared);
    const expected2   =     '    (12)-3------4-|';
    const subscriber3 = hot('           c|       ').mergeMapTo(shared);
    const expected3   =     '           (23)-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#'); const shared = source.shareReplay(1);
    const sourceSubs =      '^           !';
    const subscriber1 = hot('a|           ').mergeMapTo(shared);
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').mergeMapTo(shared);
    const expected2   =     '    23----4-#';
    const subscriber3 = hot('        c|   ').mergeMapTo(shared);
    const expected3   =     '        3-4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const shared = source.shareReplay(1);
    const expected =    '|';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';

    const shared = source.shareReplay(1);
    const expected =    '-';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const shared = source.shareReplay(1);
    const expected =    '#';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should replay results to subsequent subscriptions if source completes, bufferSize=2', () => {
    const source =     cold('-1-2-----3-|        ');
    const shared = source.shareReplay(2);
    const sourceSubs =      '^          !        ';
    const subscriber1 = hot('a|                  ').mergeMapTo(shared);
    const expected1   =     '-1-2-----3-|        ';
    const subscriber2 = hot('    b|              ').mergeMapTo(shared);
    const expected2   =     '    (12)-3-|        ';
    const subscriber3 = hot('               (c|) ').mergeMapTo(shared);
    const expected3   =     '               (23|)';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should completely restart for subsequent subscriptions if source errors, bufferSize=2', () => {
    const source =     cold('-1-2-----3-#               ');
    const shared = source.shareReplay(2);
    const sourceSubs1 =     '^          !               ';
    const subscriber1 = hot('a|                         ').mergeMapTo(shared);
    const expected1   =     '-1-2-----3-#               ';
    const subscriber2 = hot('    b|                     ').mergeMapTo(shared);
    const expected2   =     '    (12)-3-#               ';
    const subscriber3 = hot('               (c|)        ').mergeMapTo(shared);
    const expected3   =     '               -1-2-----3-#';
    const sourceSubs2 =     '               ^          !';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe([sourceSubs1, sourceSubs2]);
  });

  it('should be retryable, bufferSize=2', () => {
    const subs = [];
    const source =     cold('-1-2-----3-#                      ');
    const shared = source.shareReplay(2).retry(1);
    subs.push(              '^          !                      ');
    subs.push(              '           ^          !           ');
    subs.push(              '                      ^          !');
    const subscriber1 = hot('a|                                ').mergeMapTo(shared);
    const expected1   =     '-1-2-----3--1-2-----3-#           ';
    const subscriber2 = hot('    b|                            ').mergeMapTo(shared);
    const expected2   =     '    (12)-3--1-2-----3-#           ';
    const subscriber3 = hot('               (c|)               ').mergeMapTo(shared);
    const expected3   =     '               (12)-3--1-2-----3-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
