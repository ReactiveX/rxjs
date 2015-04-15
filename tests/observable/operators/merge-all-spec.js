import { Observable } from 'src/observable/observable';
import TestScenario from '../../test-observable';

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
    });
  });

  //HACK: this needs it's own spot.
  it('should use the TestScenario', () => {
    var scenario = new TestScenario();
    var test = scenario.createColdObservable([10, 'b'], [23, 'c'], [0, 'a']);
    var results = [];
    test.observer({
      next: x => {
        results.push(x);
      }
    });

    expect(results).toEqual([]);

    scenario.run();

    expect(results).toEqual(['a','b','c']);
  });
});