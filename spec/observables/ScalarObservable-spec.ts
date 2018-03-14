import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { scalar } from 'rxjs/observable/scalar';

declare const rxTestScheduler: Rx.TestScheduler;

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
