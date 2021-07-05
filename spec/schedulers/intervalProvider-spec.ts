/** @prettier */
import { expect } from 'chai';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';

describe('intervalProvider', () => {
  const originalSet = global.setInterval;
  const originalClear = global.clearInterval;

  afterEach(() => {
    global.setInterval = originalSet;
    global.clearInterval = originalClear;
  });

  it('should be monkey patchable', () => {
    let setCalled = false;
    let clearCalled = false;

    global.setInterval = (() => {
      setCalled = true;
      return 0 as any;
    }) as any; // TypeScript complains about a __promisify__ property
    global.clearInterval = () => {
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
