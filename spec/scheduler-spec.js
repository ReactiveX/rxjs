/* globals describe, it, expect */
var RxNext = require('../dist/cjs/RxNext');

var Scheduler = RxNext.Scheduler;

describe('Scheduler.immediate', function() {
	it('should schedule things recursively', function() {
		var call1 = false;
		var call2 = false;
		Scheduler.immediate.active = false;
		Scheduler.immediate.schedule(0, null, function(){
			call1 = true;
			Scheduler.immediate.schedule(0, null, function(){
				call2 = true;
			});
		});		
		expect(call1).toBe(true);
		expect(call2).toBe(true);
	});
});