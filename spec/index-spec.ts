import * as index from '../src/index';
import { expect } from 'chai';

describe('index', () => {
  it('should export Observable', () => {
    expect(index.Observable).to.exist;
  });

  it('should export the Subject types', () => {
    expect(index.Subject).to.exist;
    expect(index.BehaviorSubject).to.exist;
    expect(index.ReplaySubject).to.exist;
  });

  it('should export the schedulers', () => {
    expect(index.asapScheduler).to.exist;
    expect(index.asyncScheduler).to.exist;
    expect(index.queueScheduler).to.exist;
    expect(index.animationFrameScheduler).to.exist;
  });

  it('should export Subscription', () => {
    expect(index.Subscription).to.exist;
  });

  it('should export Notification', () => {
    expect(index.Notification).to.exist;
  });

  it('should export the appropriate utilities', () => {
    expect(index.pipe).to.exist;
    expect(index.noop).to.exist;
    expect(index.identity).to.exist;
  });

  it('should export constants', () => {
    expect(index.EMPTY).to.exist;
  });
});
