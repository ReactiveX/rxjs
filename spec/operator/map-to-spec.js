/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.prototype.mapTo()', function(){
	it('should map all values to the passed value', function(done) {
		var foo = { bar: 'baz' };
		Observable.of(1,2,3).mapTo(foo)
			.subscribe(function(x) {
				expect(x).toBe(foo);
			}, null, function(){
				done();
			});
	});
});