/** @prettier */
import { expect } from 'chai';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';

describe('animationFrameProvider', () => {
  const originalRequest = global.requestAnimationFrame;
  const originalCancel = global.cancelAnimationFrame;

  afterEach(() => {
    global.requestAnimationFrame = originalRequest;
    global.cancelAnimationFrame = originalCancel;
  });

  it('should be monkey patchable', () => {
    let requestCalled = false;
    let cancelCalled = false;

    global.requestAnimationFrame = () => {
      requestCalled = true;
      return 0;
    };
    global.cancelAnimationFrame = () => {
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
