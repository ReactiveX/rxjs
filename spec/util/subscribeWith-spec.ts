import { expect } from 'chai';
import { of, Subscriber } from 'rxjs';
import { subscribeWith } from 'rxjs/internal/util/subscribeWith';
import { asInteropObservable, asInteropSubscriber } from '../helpers/interop-helper';

describe('subscribeWith', () => {
  it('should return the subscriber for interop observables', () => {
    const observable = asInteropObservable(of(42));
    const subscriber = new Subscriber<number>();
    const subscription = subscribeWith(observable, subscriber);
    expect(subscription).to.equal(subscriber);
  });

  it('should return the subscriber for interop subscribers', () => {
    const observable = of(42);
    const subscriber = asInteropSubscriber(new Subscriber<number>());
    const subscription = subscribeWith(observable, subscriber);
    expect(subscription).to.equal(subscriber);
  });
});