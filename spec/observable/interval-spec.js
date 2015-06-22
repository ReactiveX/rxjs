/* globals describe, it, expect, spyOn */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;
var immediate = RxNext.Scheduler.immediate;
var Observer = RxNext.Observer;

describe('Observable.timer', function(){
	it('schedule a value of 0 then complete', function(done) {
		var start = Date.now();
		var expected = [0,1,2,3,4];
		var i = 0;
		
	  Observable.interval(10).take(5)
			.subscribe(function(x) {
				expect(x).toBe(expected[i++]);
			}, null, 
			function() {
				expect(Date.now() - start >= 50).toBe(true);
				done();
			});
	});
});