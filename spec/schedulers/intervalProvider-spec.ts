/** @prettier */
import { expect } from 'chai';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';

describe('intervalProvider', () => {
  const originalSet = globalThis.setInterval;
  const originalClear = globalThis.clearInterval;

  afterEach(() => {
    globalThis.setInterval = originalSet;
    globalThis.clearInterval = originalClear;
  });

  it('should be monkey patchable', () => {
    let setCalled = false;
    let clearCalled = false;

    globalThis.setInterval = () => {
      setCalled = true;
      return 0 as any;
    };
    globalThis.clearInterval = () => {
      clearCalled = true;
    };

    const handle = intervalProvider.setInterval(() => {
      /* noop */
    });
    intervalProvider.clearInterval(handle);

    expect(setCalled).to.be.true;
    expect(clearCalled).to.be.true;
  });
});
