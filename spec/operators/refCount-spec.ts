import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {refCount} */
describe('ConnectableObservable.prototype.refCount', () => {
  asDiagram('refCount')('should turn a multicasted Observable an automatically ' +
  '(dis)connecting hot one', () => {
    const source = cold('--1-2---3-4--5-|');
    const sourceSubs =  '^              !';
    const expected =    '--1-2---3-4--5-|';

    const result = source.publish().refCount();

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should count references', () => {
    const connectable = Observable.never().publish();
    const refCounted = connectable.refCount();

    const sub1 = refCounted.subscribe({ next: function () { //noop
      } });
    const sub2 = refCounted.subscribe({ next: function () { //noop
      } });
    const sub3 = refCounted.subscribe({ next: function () { //noop
      } });

    expect((<any>connectable)._refCount).to.equal(3);

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });

  it('should unsub from the source when all other subscriptions are unsubbed', (done: MochaDone) => {
    let unsubscribeCalled = false;
    const connectable = new Observable((observer: Rx.Observer<boolean>) => {
      observer.next(true);
      return () => {
        unsubscribeCalled = true;
      };
    }).publish();
    const refCounted = connectable.refCount();

    const sub1 = refCounted.subscribe(() => {
      //noop
    });
    const sub2 = refCounted.subscribe(() => {
      //noop
    });
    const sub3 = refCounted.subscribe((x: any) => {
      expect((<any>connectable)._refCount).to.equal(1);
    });

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();

    expect((<any>connectable)._refCount).to.equal(0);
    expect(unsubscribeCalled).to.be.true;
    done();
  });

  it('should not unsubscribe when a subscriber synchronously unsubscribes if ' +
  'other subscribers are present', () => {
    let unsubscribeCalled = false;
    const connectable = new Observable((observer: Rx.Observer<boolean>) => {
      observer.next(true);
      return () => {
        unsubscribeCalled = true;
      };
    }).publishReplay(1);

    const refCounted = connectable.refCount();

    refCounted.subscribe();
    refCounted.subscribe().unsubscribe();

    expect((<any>connectable)._refCount).to.equal(1);
    expect(unsubscribeCalled).to.be.false;
  });

  it('should not unsubscribe when a subscriber synchronously unsubscribes if ' +
  'other subscribers are present and the source is a Subject', () => {

    const arr = [];
    const subject = new Rx.Subject();
    const connectable = subject.publishReplay(1);
    const refCounted = connectable.refCount();

    refCounted.subscribe((val) => {
      arr.push(val);
    });

    subject.next('the number one');

    refCounted.first().subscribe().unsubscribe();

    subject.next('the number two');

    expect((<any>connectable)._refCount).to.equal(1);
    expect(arr[0]).to.equal('the number one');
    expect(arr[1]).to.equal('the number two');
  });
});
