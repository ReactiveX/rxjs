/** @prettier */
import { expect } from 'chai';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';

describe('timeoutProvider', () => {
  const originalSet = globalThis.setTimeout;
  const originalClear = globalThis.clearTimeout;

  afterEach(() => {
    globalThis.setTimeout = originalSet;
    globalThis.clearTimeout = originalClear;
  });

  it('should be monkey patchable', () => {
    let setCalled = false;
    let clearCalled = false;

    globalThis.setTimeout = (() => {
      setCalled = true;
      return 0 as any;
    }) as any;
    globalThis.clearTimeout = () => {
      clearCalled = true;
    };

    const handle = timeoutProvider.setTimeout(() => {
      /* noop */
    });
    timeoutProvider.clearTimeout(handle);

    expect(setCalled).to.be.true;
    expect(clearCalled).to.be.true;
  });
});
