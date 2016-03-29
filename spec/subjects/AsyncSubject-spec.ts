import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';

const AsyncSubject = Rx.AsyncSubject;

class TestObserver implements Rx.Observer<number> {
  results = [];

  next(value: number): void {
    this.results.push(value);
  }

  error(err: any): void {
    this.results.push(err);
  }

  complete(): void {
    this.results.push('done');
  }
}

/** @test {AsyncSubject} */
describe('AsyncSubject', () => {
  it('should emit the last value when complete', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    subject.subscribe(observer);

    subject.next(1);
    expect(observer.results).to.deep.equal([]);
    subject.next(2);
    expect(observer.results).to.deep.equal([]);
    subject.complete();
    expect(observer.results).to.deep.equal([2, 'done']);
  });

  it('should emit the last value when subscribing after complete', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();

    subject.next(1);
    subject.next(2);
    subject.complete();

    subject.subscribe(observer);
    expect(observer.results).to.deep.equal([2, 'done']);
  });

  it('should keep emitting the last value to subsequent subscriptions', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    const subscription = subject.subscribe(observer);

    subject.next(1);
    expect(observer.results).to.deep.equal([]);
    subject.next(2);
    expect(observer.results).to.deep.equal([]);
    subject.complete();
    expect(observer.results).to.deep.equal([2, 'done']);

    subscription.unsubscribe();

    observer.results = [];
    subject.subscribe(observer);
    expect(observer.results).to.deep.equal([2, 'done']);
  });

  it('should not emit values after complete', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();

    subject.subscribe(observer);

    subject.next(1);
    expect(observer.results).to.deep.equal([]);
    subject.next(2);
    expect(observer.results).to.deep.equal([]);
    subject.complete();
    expect(observer.results).to.deep.equal([2, 'done']);
  });

  it('should not emit values if unsubscribed before complete', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    const subscription = subject.subscribe(observer);

    subject.next(1);
    expect(observer.results).to.deep.equal([]);
    subject.next(2);
    expect(observer.results).to.deep.equal([]);

    subscription.unsubscribe();

    subject.next(3);
    expect(observer.results).to.deep.equal([]);
    subject.complete();
    expect(observer.results).to.deep.equal([]);
  });

  it('should just complete if no value has been nexted into it', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    subject.subscribe(observer);

    expect(observer.results).to.deep.equal([]);
    subject.complete();
    expect(observer.results).to.deep.equal(['done']);
  });

  it('should keep emitting complete to subsequent subscriptions', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    const subscription = subject.subscribe(observer);

    expect(observer.results).to.deep.equal([]);
    subject.complete();
    expect(observer.results).to.deep.equal(['done']);

    subscription.unsubscribe();
    observer.results = [];
    subject.subscribe(observer);
    expect(observer.results).to.deep.equal(['done']);
  });

  it('should only error if an error is passed into it', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    subject.subscribe(observer);

    subject.next(1);
    expect(observer.results).to.deep.equal([]);
    subject.error(new Error('bad'));
    expect(observer.results).to.deep.equal([new Error('bad')]);
  });

  it('should keep emitting error to subsequent subscriptions', () => {
    const subject = new AsyncSubject();
    const observer = new TestObserver();
    subject.subscribe(observer);

    subject.next(1);
    expect(observer.results).to.deep.equal([]);

    subject.error(new Error('bad'));
    expect(observer.results).to.deep.equal([new Error('bad')]);

    subject.unsubscribe();

    observer.results = [];
    subject.subscribe(observer);
    expect(observer.results).to.deep.equal([new Error('bad')]);
  });
});
