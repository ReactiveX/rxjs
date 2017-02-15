import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {publishLast} */
describe('Observable.prototype.publishLast', () => {
  asDiagram('publishLast')('should emit last notification of a simple source Observable', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const published = source.publishLast();
    const expected =    '---------------(5|)';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should return a ConnectableObservable-ish', () => {
    const source = Observable.of(1).publishLast();
    expect(typeof (<any> source)._subscribe === 'function').to.be.true;
    expect(typeof (<any> source).getSubject === 'function').to.be.true;
    expect(typeof source.connect === 'function').to.be.true;
    expect(typeof source.refCount === 'function').to.be.true;
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs = [];
    const published = source.publishLast();
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should multicast the same values to multiple observers', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^           !';
    const published = source.publishLast();
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '------------(4|)';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    --------(4|)';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        ----(4|)';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast an error from the source to multiple observers', () => {
    const source =     cold('-1-2-3----4-#');
    const sourceSubs =      '^           !';
    const published = source.publishLast();
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '------------#';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    --------#';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        ----#';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should not cast any values to multiple observers, ' +
  'when source is unsubscribed explicitly and early', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const published = source.publishLast();
    const unsub =           '         u   ';
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '----------   ';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    ------   ';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        --   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection;
    expectObservable(hot(unsub).do(() => {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = published.connect();
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source =     cold('-1-2-3----4-|');
    const sourceSubs =      '^        !   ';
    const published = source
      .mergeMap((x: string) => Observable.of(x))
      .publishLast();
    const subscriber1 = hot('a|           ').mergeMapTo(published);
    const expected1   =     '----------   ';
    const subscriber2 = hot('    b|       ').mergeMapTo(published);
    const expected2   =     '    ------   ';
    const subscriber3 = hot('        c|   ').mergeMapTo(published);
    const expected3   =     '        --   ';
    const unsub =           '         u   ';

    expectObservable(subscriber1).toBe(expected1);
    expectObservable(subscriber2).toBe(expected2);
    expectObservable(subscriber3).toBe(expected3);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    // Set up unsubscription action
    let connection;
    expectObservable(hot(unsub).do(() => {
      connection.unsubscribe();
    })).toBe(unsub);

    connection = published.connect();
  });

  describe('with refCount()', () => {
    it('should connect when first subscriber subscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^           !';
      const replayed = source.publishLast().refCount();
      const subscriber1 = hot('   a|           ').mergeMapTo(replayed);
      const expected1   =     '   ------------(4|)';
      const subscriber2 = hot('       b|       ').mergeMapTo(replayed);
      const expected2   =     '       --------(4|)';
      const subscriber3 = hot('           c|   ').mergeMapTo(replayed);
      const expected3   =     '           ----(4|)';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should disconnect when last subscriber unsubscribes', () => {
      const source =     cold(   '-1-2-3----4-|');
      const sourceSubs =      '   ^        !   ';
      const replayed = source.publishLast().refCount();
      const subscriber1 = hot('   a|           ').mergeMapTo(replayed);
      const unsub1 =          '          !     ';
      const expected1   =     '   --------     ';
      const subscriber2 = hot('       b|       ').mergeMapTo(replayed);
      const unsub2 =          '            !   ';
      const expected2   =     '       ------   ';

      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });

    it('should NOT be retryable', () => {
      const source =     cold('-1-2-3----4-#');
      const sourceSubs =      '^           !';
      const published = source.publishLast().refCount().retry(3);
      const subscriber1 = hot('a|           ').mergeMapTo(published);
      const expected1   =     '------------#';
      const subscriber2 = hot('    b|       ').mergeMapTo(published);
      const expected2   =     '    --------#';
      const subscriber3 = hot('        c|   ').mergeMapTo(published);
      const expected3   =     '        ----#';

      expectObservable(subscriber1).toBe(expected1);
      expectObservable(subscriber2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should multicast an empty source', () => {
    const source = cold('|');
    const sourceSubs =  '(^!)';
    const published = source.publishLast();
    const expected =    '|';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a never source', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const published = source.publishLast();
    const expected =    '-';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast a throw source', () => {
    const source = cold('#');
    const sourceSubs =  '(^!)';
    const published = source.publishLast();
    const expected =    '#';

    expectObservable(published).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);

    published.connect();
  });

  it('should multicast one observable to multiple observers', (done: MochaDone) => {
    const results1 = [];
    const results2 = [];
    let subscriptions = 0;

    const source = new Observable((observer: Rx.Observer<number>) => {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    const connectable = source.publishLast();

    connectable.subscribe((x: any) => {
      results1.push(x);
    });

    connectable.subscribe((x: any) => {
      results2.push(x);
    });

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal([]);

    connectable.connect();

    expect(results1).to.deep.equal([4]);
    expect(results2).to.deep.equal([4]);
    expect(subscriptions).to.equal(1);
    done();
  });
});
