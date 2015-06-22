/* globals describe, it, expect */
var RxNext = require('../dist/cjs/RxNext');

var Subject = RxNext.Subject;

describe('Subject', function() {
	it('should pump values right on through itself', function(done) {
		var subject = new Subject();
		var expected = ['foo', 'bar'];
		var i = 0;
		
		subject.subscribe(function(x) {
			expect(x).toBe(expected[i++]);
		}, null,
		function(){
			done();
		});
		
		// HACK
		RxNext.Scheduler.nextTick.schedule(0, null, function(){
			subject.next('foo');
			subject.next('bar');
			subject.return();
		});
	});
	
	
	it('should pump values to multiple observers', function(done) {
		var subject = new Subject();
		var expected = ['foo', 'bar'];
		var i = 0;
		var j = 0;
		
		subject.subscribe(function(x) {
			expect(x).toBe(expected[i++]);
		});
		
		subject.subscribe(function(x) {
			expect(x).toBe(expected[j++]);
		}, null,
		function(){
			done();
		});
		
		
		// HACK
		RxNext.Scheduler.nextTick.schedule(0, null, function(){
			expect(subject.observers.length).toBe(2);
			subject.next('foo');
			subject.next('bar');
			subject.return();
		});
	});
});