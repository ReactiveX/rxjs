import * as index from '../src/index';
import { expect } from 'chai';

describe('index', () => {
  it('should export Observable', () => {
    expect(index.Observable).to.exist;
    expect(index.ConnectableObservable).to.exist;
    // Interfaces can be checked by creating a variable of that type
    let operator: index.Operator<any, any>;
  });

  it('should export the Subject types', () => {
    expect(index.Subject).to.exist;
    expect(index.BehaviorSubject).to.exist;
    expect(index.ReplaySubject).to.exist;
    expect(index.AsyncSubject).to.exist;
  });

  it('should export the schedulers', () => {
    expect(index.asapScheduler).to.exist;
    expect(index.asyncScheduler).to.exist;
    expect(index.queueScheduler).to.exist;
    expect(index.animationFrameScheduler).to.exist;
    expect(index.VirtualTimeScheduler).to.exist;
    expect(index.VirtualAction).to.exist;
  });

  it('should export Subscription', () => {
    expect(index.Subscription).to.exist;
    expect(index.Subscriber).to.exist;
  });

  it('should export Notification', () => {
    expect(index.Notification).to.exist;
  });

  it('should export the appropriate utilities', () => {
    expect(index.pipe).to.exist;
    expect(index.noop).to.exist;
    expect(index.identity).to.exist;
  });

  it('should export error types', () => {
    expect(index.ArgumentOutOfRangeError).to.exist;
    expect(index.EmptyError).to.exist;
    expect(index.ObjectUnsubscribedError).to.exist;
    expect(index.UnsubscriptionError).to.exist;
    expect(index.TimeoutError).to.exist;
  });

  it('should export constants', () => {
    expect(index.EMPTY).to.exist;
    expect(index.NEVER).to.exist;
  });

  it('should export static observable creator functions', () => {
    expect(index.bindCallback).to.exist;
    expect(index.bindNodeCallback).to.exist;
    expect(index.combineLatest).to.exist;
    expect(index.concat).to.exist;
    expect(index.defer).to.exist;
    expect(index.empty).to.exist;
    expect(index.forkJoin).to.exist;
    expect(index.from).to.exist;
    expect(index.fromEvent).to.exist;
    expect(index.fromEventPattern).to.exist;
    expect(index.generate).to.exist;
    expect(index.iif).to.exist;
    expect(index.interval).to.exist;
    expect(index.merge).to.exist;
    expect(index.of).to.exist;
    expect(index.onErrorResumeNext).to.exist;
    expect(index.pairs).to.exist;
    expect(index.race).to.exist;
    expect(index.range).to.exist;
    expect(index.throwError).to.exist;
    expect(index.timer).to.exist;
    expect(index.using).to.exist;
    expect(index.zip).to.exist;
  });

  it('should expose configuration', () => {
    expect(index.config).to.exist;
  });
});
