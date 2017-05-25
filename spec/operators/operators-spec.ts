import {expect} from 'chai';
import {Observable} from '../../dist/cjs/Observable';
import {operators} from '../../dist/cjs/operator/operators';
import {filter} from '../../dist/cjs/operator/filter';
import {map} from '../../dist/cjs/operator/map';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

(<any>Observable.prototype).operators = operators;

/** @test {audit} */
describe('Observable.prototype.operators', () => {
  it('should work', () => {
    const source = new Observable(observer => {
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.complete();
    });

    const results = [];

    source.operators({ filter, map })
      .filter(x => x > 1)
      .map(x => x * 10)
      .subscribe(x => results.push(x), null, () => results.push('done'));

    expect(results).to.deep.equal([20, 30, 'done']);
  });
});
