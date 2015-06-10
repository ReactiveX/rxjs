import { Observable } from 'src/observable/observable';
import VirtualScheduler from 'src/scheduler/virtual-scheduler';

//TODO: This test is *really* primitive. There's definitely more than can be done.
describe('observeOn', () => {
  it('should schedule events with a provided scheduler', () => {
    var observable = new Observable((generator) => {
      generator.next(1);
      generator.return();
    });

    var myScheduler = {
      schedule: jasmine.createSpy('scheduler.schedule')
    };

    observable.observeOn(myScheduler).observer({
      next: function(){}
    });

    expect(myScheduler.schedule).toHaveBeenCalled();
  });

  it('should use the provided scheduler for all observations', done => {
    var observable = new Observable((generator) => {
      generator.next(1);
      generator.return();
    });

    var myScheduler = new VirtualScheduler();

    var y = 0;
    observable.observeOn(myScheduler).observer({
      next: function(x){
        expect(x).toBe(1);
        y = x;
      }
    });

    expect(y).toBe(0);
    myScheduler.flush();
    expect(y).toBe(1);
    done();
  });
});