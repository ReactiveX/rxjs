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

	it('should not emit, throw or complete if immediately unsubscribed', function(done){
		var nextSpy = jasmine.createSpy('next');
		var throwSpy = jasmine.createSpy('throw');
		var completeSpy = jasmine.createSpy('complete');
		var promise = Promise.resolve(42);
		var subscription = Observable.fromPromise(promise)
			.subscribe(nextSpy, throwSpy, completeSpy);
		subscription.unsubscribe();

	  setTimeout(function() {
		  expect(nextSpy).not.toHaveBeenCalled();
		  expect(throwSpy).not.toHaveBeenCalled();
		  expect(completeSpy).not.toHaveBeenCalled();
		  done();
	  });
	});
});