import { expect } from 'chai';
import { of as scalar } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

declare const rxTestScheduler: TestScheduler;

describe('scalar', () => {
  it('should create expose a value property', () => {
    const s = scalar(1);
    expect((s as any).value).to.equal(1);
  });

  it('should set `_isScalar` to true when NOT called with a Scheduler', () => {
    const s = scalar(1);
    expect(s._isScalar).to.be.true;
  });
});
