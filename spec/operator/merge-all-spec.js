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
});