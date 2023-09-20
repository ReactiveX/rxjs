/** @prettier */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { animationFrames } from 'rxjs';
import { mergeMapTo, take, takeUntil } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../../helpers/observableMatcher';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';

describe('animationFrames', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should animate', function () {
    testScheduler.run(({ animate, cold, expectObservable, time }) => {
      animate('            ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const tc = time('    -----------|');
      const expected = '   ---a---b---c';
      const subs = '       ^----------!';

      const result = mapped.pipe(mergeMapTo(animationFrames()));
      expectObservable(result, subs).toBe(expected, {
        a: { elapsed: ta - tm, timestamp: ta },
        b: { elapsed: tb - tm, timestamp: tb },
        c: { elapsed: tc - tm, timestamp: tc },
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

    testScheduler.run(({ animate, cold, expectObservable }) => {
      animate('            ---x---x---x');
      const mapped = cold('-m          ');
      const expected = '   ---a---b---c';
      const subs = '       ^----------!';

      const result = mapped.pipe(mergeMapTo(animationFrames(timestampProvider)));
      expectObservable(result, subs).toBe(expected, {
        a: { elapsed: 50, timestamp: 100 },
        b: { elapsed: 150, timestamp: 200 },
        c: { elapsed: 250, timestamp: 300 },
      });
    });
  });

  it('should compose with take', () => {
    testScheduler.run(({ animate, cold, expectObservable, time }) => {
      const requestSpy = sinon.spy(animationFrameProvider.delegate!, 'requestAnimationFrame');
      const cancelSpy = sinon.spy(animationFrameProvider.delegate!, 'cancelAnimationFrame');

      animate('            ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const expected = '   ---a---b    ';

      const result = mapped.pipe(mergeMapTo(animationFrames().pipe(take(2))));
      expectObservable(result).toBe(expected, {
        a: { elapsed: ta - tm, timestamp: ta },
        b: { elapsed: tb - tm, timestamp: tb },
      });

      testScheduler.flush();
      // Requests are made at times tm and ta
      expect(requestSpy.callCount).to.equal(2);
      // No request cancellation is effected, as unsubscription occurs before rescheduling
      expect(cancelSpy.callCount).to.equal(0);
    });
  });

  it('should compose with takeUntil', () => {
    testScheduler.run(({ animate, cold, expectObservable, hot, time }) => {
      const requestSpy = sinon.spy(animationFrameProvider.delegate!, 'requestAnimationFrame');
      const cancelSpy = sinon.spy(animationFrameProvider.delegate!, 'cancelAnimationFrame');

      animate('            ---x---x---x');
      const mapped = cold('-m          ');
      const tm = time('    -|          ');
      const ta = time('    ---|        ');
      const tb = time('    -------|    ');
      const signal = hot(' ^--------s--');
      const expected = '   ---a---b    ';

      const result = mapped.pipe(mergeMapTo(animationFrames().pipe(takeUntil(signal))));
      expectObservable(result).toBe(expected, {
        a: { elapsed: ta - tm, timestamp: ta },
        b: { elapsed: tb - tm, timestamp: tb },
      });

      testScheduler.flush();
      // Requests are made at times tm and ta and tb
      expect(requestSpy.callCount).to.equal(3);
      // Unsubscription effects request cancellation when signalled
      expect(cancelSpy.callCount).to.equal(1);
    });
  });
});
