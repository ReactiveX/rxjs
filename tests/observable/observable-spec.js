import Observable from 'src/observable/observable';

describe('Observable', () => {
	it('should exist', () => {
		expect(typeof Observable).toBe('function');
	});

	describe('lift map()', () => {
		it('should change the output value', done => {
			var observable = new Observable(generator => {
				generator.next(42);
				generator.return();
			});

			observable.map(x => x + 1).observer({
				next: x => {
					expect(x).toBe(43);
					done();
				}
			});
		});
	});


	describe('observer-observable pair map2()', () => {
		it('should change the output value', done => {
			var observable = new Observable(generator => {
				generator.next(42);
				generator.return();
			});

			observable.map2(x => x + 1).observer({
				next: x => {
					expect(x).toBe(43);
					done();
				}
			});
		});
	});
});