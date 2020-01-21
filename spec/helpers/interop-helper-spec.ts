import { expect } from 'chai';
import { Observable, of, Subscriber } from 'rxjs';
import { observable as symbolObservable } from 'rxjs/internal/symbol/observable';
import { rxSubscriber as symbolSubscriber } from 'rxjs/internal/symbol/rxSubscriber';
import { asInteropObservable, asInteropSubscriber } from './interop-helper';

describe('interop helper', () => {
  it('should simulate interop observables', () => {
    const observable: any = asInteropObservable(of(42));
    expect(observable).to.not.be.instanceOf(Observable);
    expect(observable[symbolObservable]).to.be.a('function');
  });

  it('should simulate interop subscribers', () => {
    const subscriber: any = asInteropSubscriber(new Subscriber());
    expect(subscriber).to.not.be.instanceOf(Subscriber);
    expect(subscriber[symbolSubscriber]).to.be.undefined;
  });
});