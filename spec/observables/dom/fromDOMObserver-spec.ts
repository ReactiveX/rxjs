import {expect} from 'chai';
import * as Rx from '../../../dist/cjs/Rx';
import marbleTestingSignature = require('../../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const rxTestScheduler: Rx.TestScheduler;

const Observable = Rx.Observable;

type RecordCallback = (record: any, ...rest: any[]) => void;

/** @test {fromDOMObserver} */
describe('Observable.fromDOMObserver', () => {
  let observerInstance;
  class MockDOMObserver {
    protected _args: any[];
    protected _connected: boolean;

    constructor(protected _callback: RecordCallback) {
      observerInstance = this;
    }
    observe(...args: any[]) {
      this._args = args;
      this._connected = true;
    }
    disconnect() {
      this._connected = false;
    }
  }

  beforeEach(() => {
    observerInstance = null;
  });

  it('does not construct a DOM Observer until the Rx Observable is subscribed to', () => {
    const o = Observable.fromDOMObserver(MockDOMObserver, 'some', 'additional', {args: true});
    expect(observerInstance).to.be.null;

    /* tslint:disable:no-empty */
    const subscription = o.subscribe(() => {});
    /* tslint:enable:no-empty */
    expect(observerInstance).not.to.be.null;
    expect(observerInstance._args).to.deep.equal(['some', 'additional', {args: true}]);
    expect(observerInstance._connected).to.be.true;
    subscription.unsubscribe();
  });

  it('calls `disconnect` on the underlying DOM Observer', () => {
    const o = Observable.fromDOMObserver(MockDOMObserver, 'some', 'additional', {args: true});

    /* tslint:disable:no-empty */
    const subscription = o.subscribe(() => {});
    /* tslint:enable:no-empty */
    expect(observerInstance._connected).to.be.true;
    subscription.unsubscribe();
    expect(observerInstance._connected).to.be.false;
  });

  asDiagram('fromDOMObserver that emits arrays')
  ('should create an observable of the individual elements of the array emitted from the DOM Observer', () => {
    class MockDOMObserverEmitsArray extends MockDOMObserver {
      observe(...args: any[]) {
        super.observe(...args);
        Observable.timer(50, 60, rxTestScheduler)
          .mapTo(['foo', 'bar', 'baz'])
          .take(2)
          .subscribe(this._callback);
        }
    }

    const e1 = Observable.fromDOMObserver(MockDOMObserverEmitsArray, 'some', 'additional', {args: true});

    const expected = '-----(xyz)-(xyz)---';
    expectObservable(e1).toBe(expected, {x: 'foo', y: 'bar', z: 'baz'});
  });

  asDiagram('fromDOMObserver that emits an entryList ({ getEntries: () => any[] })')
  ('should create an observable of the individual elements of the array returned ' +
   'from the getEntries method of the entrylist emitted from the DOM Observer', () => {
    class MockDOMObserverEmitsEntryList extends MockDOMObserver {
      observe(...args: any[]) {
        super.observe(...args);
        Observable.timer(50, 60, rxTestScheduler)
          .mapTo({
            getEntries: () => ['foo', 'bar', 'baz']
          })
          .take(2)
          .subscribe(this._callback);
        }
    }

    const e1 = Observable.fromDOMObserver(MockDOMObserverEmitsEntryList, 'some', 'additional', {args: true});

    const expected = '-----(xyz)-(xyz)---';
    expectObservable(e1).toBe(expected, {x: 'foo', y: 'bar', z: 'baz'});
  });

  asDiagram('fromDOMObserver that emits any object')
  ('should create an observable of the records emitted from the DOM Observer', () => {
    class MockDOMObserverEmitsAnything extends MockDOMObserver {
      observe(...args: any[]) {
        super.observe(...args);
        Observable.timer(50, 20, rxTestScheduler)
          .mapTo('record')
          .take(2)
          .subscribe(this._callback);
        }
    }

    const e1 = Observable.fromDOMObserver(MockDOMObserverEmitsAnything, 'some', 'additional', {args: true});

    const expected = '-----x-x---';
    expectObservable(e1).toBe(expected, {x: 'record'});
  });
});
