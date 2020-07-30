import { expect } from 'chai';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';
import { Subscriber, Observable } from 'rxjs';
import { asInteropSubscriber } from './helpers/interop-helper';

/** @test {Subscriber} */
describe('Subscriber', () => {
  it('should ignore next messages after unsubscription', () => {
    let times = 0;

    const sub = new Subscriber({
      next() { times += 1; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();

    expect(times).to.equal(2);
  });

  it('should wrap unsafe observers in a safe subscriber', () => {
    const observer = {
      next(x: any) { /* noop */ },
      error(err: any) { /* noop */ },
      complete() { /* noop */ }
    };

    const subscriber = new Subscriber(observer);
    expect((subscriber as any).destination).not.to.equal(observer);
    expect((subscriber as any).destination).to.be.an.instanceof(SafeSubscriber);
  });

  it('should ignore error messages after unsubscription', () => {
    let times = 0;
    let errorCalled = false;

    const sub = new Subscriber({
      next() { times += 1; },
      error() { errorCalled = true; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.error();

    expect(times).to.equal(2);
    expect(errorCalled).to.be.false;
  });

  it('should ignore complete messages after unsubscription', () => {
    let times = 0;
    let completeCalled = false;

    const sub = new Subscriber({
      next() { times += 1; },
      complete() { completeCalled = true; }
    });

    sub.next();
    sub.next();
    sub.unsubscribe();
    sub.next();
    sub.complete();

    expect(times).to.equal(2);
    expect(completeCalled).to.be.false;
  });

  it('should not be closed when other subscriber with same observer instance completes', () => {
    const observer = {
      next: function () { /*noop*/ }
    };

    const sub1 = new Subscriber(observer);
    const sub2 = new Subscriber(observer);

    sub2.complete();

    expect(sub1.closed).to.be.false;
    expect(sub2.closed).to.be.true;
  });

  it('should call complete observer without any arguments', () => {
    let argument: Array<any> | null = null;

    const observer = {
      complete: (...args: Array<any>) => {
        argument = args;
      }
    };

    const sub1 = new Subscriber(observer);
    sub1.complete();

    expect(argument).to.have.lengthOf(0);
  });

  it('should chain interop unsubscriptions', () => {
    let observableUnsubscribed = false;
    let subscriberUnsubscribed = false;
    let subscriptionUnsubscribed = false;

    const subscriber = new Subscriber<void>();
    subscriber.add(() => subscriberUnsubscribed = true);

    const source = new Observable<void>(() => () => observableUnsubscribed = true);
    const subscription = source.subscribe(asInteropSubscriber(subscriber));
    subscription.add(() => subscriptionUnsubscribed = true);
    subscriber.unsubscribe();

    expect(observableUnsubscribed).to.be.true;
    expect(subscriberUnsubscribed).to.be.true;
    expect(subscriptionUnsubscribed).to.be.true;
  });

  it('should have idempotent unsubscription', () => {
    let count = 0;
    const subscriber = new Subscriber();
    subscriber.add(() => ++count);
    expect(count).to.equal(0);

    subscriber.unsubscribe();
    expect(count).to.equal(1);

    subscriber.unsubscribe();
    expect(count).to.equal(1);
  });
});
