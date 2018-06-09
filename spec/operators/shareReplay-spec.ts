import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { shareReplay, mergeMapTo, retry, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { Observable, interval, Operator, Observer } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

/** @test {shareReplay} */
describe('shareReplay operator', () => {
  it('should mirror a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const published = source.pipe(shareReplay());
    const expected =    '--1-2---3-4--5-|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should do nothing if result is not subscribed', () => {
    let subscribed = false;
    const source = new Observable(() => {
      subscribed = true;
    });
    source.pipe(shareReplay());
    expect(subscribed).to.be.false;
  });

  it('should multicast the same values to multiple observers, bufferSize=1', () => {
    const source =     cold('-1-2-3----4-|'); const shared = source.pipe(shareReplay(1));
    const sourceSubs =      '^           !';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-3----4-|';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
    const expected2   =     '    23----4-|';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
    const expected3   =     '        3-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers, bufferSize=2', () => {
    const source =     cold('-1-2-----3------4-|'); const shared = source.pipe(shareReplay(2));
    const sourceSubs =      '^                 !';
    const subscriber1 = hot('a|                 ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-----3------4-|';
    const subscriber2 = hot('    b|             ').pipe(mergeMapTo(shared));
    const expected2   =     '    (12)-3------4-|';
    const subscriber3 = hot('           c|       ').pipe(mergeMapTo(shared));
    const expected3   =     '           (23)-4-|';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#'); const shared = source.pipe(shareReplay(1));
    const sourceSubs =      '^           !';
    const subscriber1 = hot('a|           ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-3----4-#';
    const subscriber2 = hot('    b|       ').pipe(mergeMapTo(shared));
    const expected2   =     '    23----4-#';
    const subscriber3 = hot('        c|   ').pipe(mergeMapTo(shared));
    const expected3   =     '        3-4-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const shared = source.pipe(shareReplay(1));
    const expected =    '|';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';

    const shared = source.pipe(shareReplay(1));
    const expected =    '-';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const shared = source.pipe(shareReplay(1));
    const expected =    '#';

    expectObservable(shared).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should replay results to subsequent subscriptions if source completes, bufferSize=2', () => {
    const source =     cold('-1-2-----3-|        ');
    const shared = source.pipe(shareReplay(2));
    const sourceSubs =      '^          !        ';
    const subscriber1 = hot('a|                  ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-----3-|        ';
    const subscriber2 = hot('    b|              ').pipe(mergeMapTo(shared));
    const expected2   =     '    (12)-3-|        ';
    const subscriber3 = hot('               (c|) ').pipe(mergeMapTo(shared));
    const expected3   =     '               (23|)';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should completely restart for subsequent subscriptions if source errors, bufferSize=2', () => {
    const source =     cold('-1-2-----3-#               ');
    const shared = source.pipe(shareReplay(2));
    const sourceSubs1 =     '^          !               ';
    const subscriber1 = hot('a|                         ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-----3-#               ';
    const subscriber2 = hot('    b|                     ').pipe(mergeMapTo(shared));
    const expected2   =     '    (12)-3-#               ';
    const subscriber3 = hot('               (c|)        ').pipe(mergeMapTo(shared));
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
    const shared = source.pipe(shareReplay(2), retry(1));
    subs.push(              '^          !                      ');
    subs.push(              '           ^          !           ');
    subs.push(              '                      ^          !');
    const subscriber1 = hot('a|                                ').pipe(mergeMapTo(shared));
    const expected1   =     '-1-2-----3--1-2-----3-#           ';
    const subscriber2 = hot('    b|                            ').pipe(mergeMapTo(shared));
    const expected2   =     '    (12)-3--1-2-----3-#           ';
    const subscriber3 = hot('               (c|)               ').pipe(mergeMapTo(shared));
    const expected3   =     '               (12)-3--1-2-----3-#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not restart if refCount hits 0 due to unsubscriptions', () => {
    const results: number[] = [];
    const source = interval(10, rxTestScheduler).pipe(
      take(10),
      shareReplay(1)
    );
    const subs = source.subscribe(x => results.push(x));
    rxTestScheduler.schedule(() => subs.unsubscribe(), 35);
    rxTestScheduler.schedule(() => source.subscribe(x => results.push(x)), 54);

    rxTestScheduler.flush();
    expect(results).to.deep.equal([0, 1, 2, 4, 5, 6, 7, 8, 9]);
  });

  it('should not break lift() composability', (done: MochaDone) => {
    class MyCustomObservable<T> extends Observable<T> {
      lift<R>(operator: Operator<T, R>): Observable<R> {
        const observable = new MyCustomObservable<R>();
        (<any>observable).source = this;
        (<any>observable).operator = operator;
        return observable;
      }
    }

    const result = new MyCustomObservable((observer: Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    }).pipe(shareReplay());

    expect(result instanceof MyCustomObservable).to.be.true;

    const expected = [1, 2, 3];

    result
      .subscribe((n: any) => {
        expect(expected.length).to.be.greaterThan(0);
        expect(n).to.equal(expected.shift());
      }, (x) => {
        done(new Error('should not be called'));
      }, () => {
        done();
      });
  });
});
