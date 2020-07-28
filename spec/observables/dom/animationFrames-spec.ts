/** @prettier */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { animationFrames } from 'rxjs';
import { mergeMapTo, take, takeUntil } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../../helpers/observableMatcher';
import { requestAnimationFrameProvider } from 'rxjs/internal/scheduler/requestAnimationFrameProvider';

describe('animationFrames', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should animate', function () {
    testScheduler.run(({ cold, expectObservable, repaints, time }) => {
      repaints('           ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const tc = time('    -----------|');
      const expected = '   ---a---b---c';
      const subs = '       ^----------!';

      const result = mapped.pipe(mergeMapTo(animationFrames()));
      expectObservable(result, subs).toBe(expected, {
        a: ta - tm,
        b: tb - tm,
        c: tc - tm,
      });
    });
  });

  it('should use any passed timestampProvider', () => {
    let i = 0;
    const timestampProvider = {
      now: sinon.stub().callsFake(() => {
        return [50, 100, 200, 300][i++];
      }),
    };

    testScheduler.run(({ cold, expectObservable, repaints }) => {
      repaints('           ---x---x---x');
      const mapped = cold('-m          ');
      const expected = '   ---a---b---c';
      const subs = '       ^----------!';

      const result = mapped.pipe(mergeMapTo(animationFrames(timestampProvider)));
      expectObservable(result, subs).toBe(expected, {
        a: 50,
        b: 150,
        c: 250,
      });
    });
  });

  it('should compose with take', () => {
    testScheduler.run(({ cold, expectObservable, repaints, time }) => {
      const requestSpy = sinon.spy(requestAnimationFrameProvider.delegate!, 'requestAnimationFrame');
      const cancelSpy = sinon.spy(requestAnimationFrameProvider.delegate!, 'cancelAnimationFrame');

      repaints('           ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const expected = '   ---a---b    ';

      const result = mapped.pipe(mergeMapTo(animationFrames().pipe(take(2))));
      expectObservable(result).toBe(expected, {
        a: ta - tm,
        b: tb - tm,
      });

      testScheduler.flush();
      // Requests are made at times tm and ta
      expect(requestSpy.callCount).to.equal(2);
      // No request cancellation is effected, as unsubscription occurs before rescheduling
      expect(cancelSpy.callCount).to.equal(0);
    });
  });

  it('should compose with takeUntil', () => {
    testScheduler.run(({ cold, expectObservable, hot, repaints, time }) => {
      const requestSpy = sinon.spy(requestAnimationFrameProvider.delegate!, 'requestAnimationFrame');
      const cancelSpy = sinon.spy(requestAnimationFrameProvider.delegate!, 'cancelAnimationFrame');

      repaints('           ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const signal = hot(' ^--------s--');
      const expected = '   ---a---b    ';

      const result = mapped.pipe(mergeMapTo(animationFrames().pipe(takeUntil(signal))));
      expectObservable(result).toBe(expected, {
        a: ta - tm,
        b: tb - tm,
      });

      testScheduler.flush();
      // Requests are made at times tm and ta and tb
      expect(requestSpy.callCount).to.equal(3);
      // Unsubscription effects request cancellation when signalled
      expect(cancelSpy.callCount).to.equal(1);
    });
  });
});
