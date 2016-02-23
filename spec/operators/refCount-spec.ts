import * as Rx from '../../dist/cjs/Rx';
declare const {cold, expectObservable, asDiagram, expectSubscriptions};
import {DoneSignature} from '../helpers/test-helper';

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
    const source = Observable.never().publish().refCount();

    const sub1 = source.subscribe({ next: function () { //noop
      } });
    const sub2 = source.subscribe({ next: function () { //noop
      } });
    const sub3 = source.subscribe({ next: function () { //noop
      } });

    expect((<any>source).refCount).toBe(3);

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();
  });

  it('should unsub from the source when all other subscriptions are unsubbed', (done: DoneSignature) => {
    let unsubscribeCalled = false;
    const source = new Observable((observer: Rx.Observer<boolean>) => {
      observer.next(true);

      return () => {
        unsubscribeCalled = true;
      };
    }).publish().refCount();

    const sub1 = source.subscribe(() => {
      //noop
    });
    const sub2 = source.subscribe(() => {
      //noop
    });
    const sub3 = source.subscribe((x: any) => {
      expect((<any>source).refCount).toBe(1);
    });

    sub1.unsubscribe();
    sub2.unsubscribe();
    sub3.unsubscribe();

    expect((<any>source).refCount).toBe(0);
    expect(unsubscribeCalled).toBe(true);
    done();
  });
});