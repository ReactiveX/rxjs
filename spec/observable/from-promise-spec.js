/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.fromPromise', function(){
	it('should emit one value from that promise', function(done) {
		var promise = Promise.resolve(42);
		Observable.fromPromise(promise)
			.subscribe(function(x) {
				expect(x).toBe(42);
			}, null,
			function(x) {
				expect(x).toBe(undefined);
				done();
			});
	});
	
	it('should cancel', function(done){
		var promise = Promise.resolve(42);
		var subscription = Observable.fromPromise(promise)
			.subscribe(function(x) {
				expect(x).toBe(42);
			}, null,
			function(x) {
				expect(x).toBe(undefined);
			},
			function() {
				done();
			});
	  subscription.unsubscribe();
	});
});