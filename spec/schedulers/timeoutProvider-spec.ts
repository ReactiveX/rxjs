/** @prettier */
import { expect } from 'chai';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';

describe('timeoutProvider', () => {
  const originalSet = global.setTimeout;
  const originalClear = global.clearTimeout;

  afterEach(() => {
    global.setTimeout = originalSet;
    global.clearTimeout = originalClear;
  });

  it('should be monkey patchable', () => {
    let setCalled = false;
    let clearCalled = false;

    global.setTimeout = (() => {
      setCalled = true;
      return 0 as any;
    }) as any;
    global.clearTimeout = () => {
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
