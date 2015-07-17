/* globals describe, it, expect, spyOn */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;
var immediate = RxNext.Scheduler.immediate;
var Observer = RxNext.Observer;

describe('Observable.interval', function(){
	it('should next 5 times then complete', function() {
		jasmine.clock().install();
		jasmine.clock().mockDate();
		var start = Date.now();
		var expected = [0,1,2,3,4];
		var i = 0;
		var nextSpy = jasmine.createSpy('nextSpy');

		Observable.interval(10).take(5)
			.subscribe(nextSpy, null,
				function() {
					expect(Date.now() - start >= 50).toBe(true);
				});
		jasmine.clock().tick(11);
		jasmine.clock().tick(21);
		jasmine.clock().tick(31);
		jasmine.clock().tick(41);
		jasmine.clock().tick(51);
		expect(nextSpy.calls.count()).toBe(5);
		expected.forEach(function (v) {
			expect(nextSpy.calls.argsFor(v)[0]).toBe(v);
		});
		jasmine.clock().uninstall();
	});
});