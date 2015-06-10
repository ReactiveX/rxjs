import NextFrameScheduler from 'src/scheduler/next-frame-scheduler';

describe('NextFrameScheduler', () => {
  it("should run scheduled work asynchronously", done => {
    var scheduler = new NextFrameScheduler();

    var afterSchedule = false;
    scheduler.schedule({}, () => {
      expect(afterSchedule).toBe(true);
      done();
    });
    afterSchedule = true;
  });
});