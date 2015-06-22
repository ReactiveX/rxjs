/* globals describe, it, expect, spyOn */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;
var immediate = RxNext.Scheduler.immediate;
var Observer = RxNext.Observer;

describe('Observable.timer', function(){
	it('schedule a value of 0 then complete', function(done) {
		var start = Date.now();
		
		//HACK: need virtual scheduler here.
	  Observable.timer(100)
			.subscribe(function(x) {
				expect(x).toBe(0)
			}, null, 
			function() {
				expect(Date.now() - start >= 100).toBe(true);
				done();
			});
	});
});