import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {ScalarObservable} from '../../dist/cjs/observable/ScalarObservable';
import {it} from '../helpers/test-helper';

declare const rxTestScheduler: Rx.TestScheduler;

describe('ScalarObservable', () => {
  it('should create expose a value property', () => {
    const s = new ScalarObservable(1);
    expect(s.value).toBe(1);
  });

  it('should create ScalarObservable via static create function', () => {
    const s = new ScalarObservable(1);
    const r = ScalarObservable.create(1);

    expect(s).toEqual(r);
  });

  it('should not schedule further if subscriber unsubscribed', () => {
    const s = new ScalarObservable(1, rxTestScheduler);
    const subscriber = new Rx.Subscriber();
    s.subscribe(subscriber);
    subscriber.isUnsubscribed = true;
    rxTestScheduler.flush();
  });
});