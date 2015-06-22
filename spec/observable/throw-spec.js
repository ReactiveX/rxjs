/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.throw', function(){
	it('should emit one value', function() {
		var calls = 0;
		Observable.throw('bad').subscribe(function() {
			throw 'should not be called';
		}, function(err) {
			expect(++calls).toBe(1);
			expect(err).toBe('bad');
		});
	});
});