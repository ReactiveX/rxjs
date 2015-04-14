// import { Observable } from 'src/observable/observable';
import { Observable } from 'src/index';

describe('Observable.mergeAll', () => {
	it('should merge many observables into one', done => {
		var observable = new Observable((generator) => {
			generator.next(Observable.return(1));
			generator.next(Observable.return(2));
			generator.next(Observable.return(3));
			generator.return();
		});

		var results = [1,2,3];
		var i = 0;

		observable.mergeAll().observer({
			next(value) {
				expect(value).toBe(results[i++]);
				expect(i <= 3);
			},
			return() {
				done();
			}
		})
	});
});