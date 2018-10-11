import { isScheduler } from 'rxjs/internal/util/isScheduler';
import { expect } from 'chai';

describe('isScheduler', () => {
  it('should identify any scheduler like', () => {
    const result = isScheduler({
      schedule() { }
    });

    expect(result).to.be.true;
  });


  it('should identify things that are not schedulers', () => {
    expect(isScheduler(null)).to.be.false;
    expect(isScheduler(0)).to.be.false;
    expect(isScheduler({})).to.be.false;
    expect(isScheduler('I am totally a scheduler')).to.be.false;
    expect(isScheduler({ thisTestIsSilly: true })).to.be.false;
  });
});
