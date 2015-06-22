/* globals describe, it, expect */
var RxNext = require('../../dist/cjs/RxNext');
var Observable = RxNext.Observable;

describe('Observable.value or Observable.return', function(){
	it('should emit one value', function(done) {
		Observable.value(42).map(function(x) { return x + '!'; })
			.subscribe(function(x) {
				expect(x).toBe('42!');
				done();
			});
	});
	
	it('should emit multiple values', function(done) {
		var expected = ['1!', '2!', '3!'];
		var i = 0;
		Observable.fromArray([1,2,3]).map(function(x) {
			return x + '!';
		})
		.subscribe(function(x) {
			expect(x).toBe(expected[i++]);
		},
		null,
		function() {
			done();
		});
	});
	
	it('should send errors down the error path', function(done) {
		Observable.value(42).map(function(x) {
			throw 'bad';
		})
		.subscribe(function(x) {
			expect(true).toBe(false);
		}, function(err) {
			expect(err).toBe('bad');
			done();
		}, function() {
			expect(true).toBe(false);
		});
	});
});