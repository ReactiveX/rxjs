import { Observable } from 'src/observable/observable';
import SubscriptionReference from 'src/subscription/subscription-reference';

describe('Observable', () => {
	it('should exist', () => {
		expect(typeof Observable).toBe('function');
	});

	describe('observer(generator)', () => {
		it('should return a subscription reference', () => {
			var observable = new Observable(_ => {});
			var subref = observable.observer({});
			expect(subref instanceof SubscriptionReference).toBe(true);
		});

		it('should invoke the dispose action '+
		    'when the subscription has been disposed', () => {
			var disposeAction = jasmine.createSpy();
			var observable = new Observable(_ => disposeAction);
			var subscription = observable.observer({});

			subscription.dispose();

			expect(disposeAction).toHaveBeenCalled();
		});

		it('should not call methods on the observer '+
		   'after the subscription has been disposed', () => {
			var generator;
			var observable = new Observable(g => {generator = g;});
			var subscription = observable.observer({
				next: 		_ => {throw 'Should not be called'},
				'throw': 	_ => {throw 'Should not be called'},
				'return':	_ => {throw 'Should not be called'}
			});

			subscription.dispose();

			expect(() => generator.next(42)).not.toThrow();
			expect(() => generator.throw(new Error())).not.toThrow();
			expect(() => generator.return(42)).not.toThrow();
		});
	});

	describe('map()', () => {
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

	describe('flatMap()', () => {
		it('should flatten return observables', done => {
			var observable = new Observable(generator => {
				generator.next(new Observable(gen2 => {
					gen2.next(42);
					gen2.return();
				}));
				generator.return();
			});

			observable.flatMap(x => x).observer({
				next: x => {
					expect(x).toBe(42);
					done();
				}
			});
		});
	});

	describe('Observable.return(value)', () => {
		it('should return an observable of just that value', done => {
			var observable = Observable.return(42);
			var calls = 0;

			observable.observer({
				next(x) {
					expect(x).toBe(42);
					expect(++calls).toBe(1);
				},

				return() {
					done();
				}
			});
		});
	})
});