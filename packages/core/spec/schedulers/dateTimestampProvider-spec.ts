/** @prettier */
import { expect } from 'chai';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';

describe('dateTimestampProvider', () => {
  const originalDate = global.Date;

  afterEach(() => {
    global.Date = originalDate;
  });

  it('should be monkey patchable', () => {
    let nowCalled = false;

    global.Date = {
      now() {
        nowCalled = true;
        return 0;
      },
    } as any;

    dateTimestampProvider.now();

    expect(nowCalled).to.be.true;
  });
});
