/** @prettier */
import { expect } from 'chai';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';

describe('animationFrameProvider', () => {
  const originalRequest = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRequest;
    globalThis.cancelAnimationFrame = originalCancel;
  });

  it('should be monkey patchable', () => {
    let requestCalled = false;
    let cancelCalled = false;

    globalThis.requestAnimationFrame = () => {
      requestCalled = true;
      return 0;
    };
    globalThis.cancelAnimationFrame = () => {
      cancelCalled = true;
    };

    const handle = animationFrameProvider.requestAnimationFrame(() => {
      /* noop */
    });
    animationFrameProvider.cancelAnimationFrame(handle);

    expect(requestCalled).to.be.true;
    expect(cancelCalled).to.be.true;
  });
});
