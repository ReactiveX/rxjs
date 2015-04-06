import { Observable } from 'src/observable/observable';

//TODO: This test is *really* primitive. There's definitely more than can be done.
describe('observeOn', () => {
	it('should schedule events with a provided scheduler', () => {
		var observable = new Observable((generator) => {
			generator.next(1);
			generator.return();
		});


		var results = [1,2,3];
		var i = 0;

		var myScheduler = {
			schedule: jasmine.createSpy('scheduler.schedule')
		};

		observable.observeOn(myScheduler).observer({
			next: function(){}
		});

		expect(myScheduler.schedule).toHaveBeenCalled();
	});
});