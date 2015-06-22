/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('mergeAll', function(){
	it('should merge all obsevables in an obsevable', function(done){
		var expected = [1,2,3];
		var i = 0;
		Observable.fromArray([
			Observable.value(1),
			Observable.value(2),
			Observable.value(3)
		])
		.mergeAll()
		.subscribe(function(x) {
			expect(x).toBe(expected[i++]);
		}, null, function(){ 
			done();
		});
	});
	
	it('should throw if any child observable throws', function(done) {
		Observable.fromArray([
			Observable.value(1),
			Observable.throw('bad'),
			Observable.value(3)
		])
		.mergeAll()
		.subscribe(function(x) {
			expect(x).toBe(1);
		}, function(err) {
			expect(err).toBe('bad');
			done();
		})
	});
});