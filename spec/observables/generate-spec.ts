import { TestScheduler } from 'rxjs/testing';
import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';
import { generate, Subscriber } from 'rxjs';
import { take } from 'rxjs/operators';

declare function asDiagram(arg: string): Function;
declare const rxTestScheduler: TestScheduler;

function err(): any {
  throw 'error';
}

describe('generate', () => {
  asDiagram('generate(1, x => false, x => x + 1)')
  ('should complete if condition does not meet', () => {
    const source = generate(1, x => false, x => x + 1);
    const expected = '|';

    expectObservable(source).toBe(expected);
  });

  asDiagram('generate(1, x => x == 1, x => x + 1)')
  ('should produce first value immediately', () => {
    const source = generate(1, x => x == 1, x => x + 1);
    const expected = '(1|)';

    expectObservable(source).toBe(expected, { '1': 1 });
  });

  asDiagram('generate(1, x => x < 3, x => x + 1)')
  ('should produce all values synchronously', () => {
    const source = generate(1, x => x < 3, x => x + 1);
    const expected = '(12|)';

    expectObservable(source).toBe(expected, { '1': 1, '2': 2 });
  });

  it('should use result selector', () => {
    const source = generate(1, x => x < 3, x => x + 1, x => (x + 1).toString());
    const expected = '(23|)';

    expectObservable(source).toBe(expected);
  });

  it('should allow omit condition', () => {
    const source = generate({
      initialState: 1,
      iterate: x => x + 1,
      resultSelector: (x: number) => x.toString()
    }).pipe(
      take(5)
    );
    const expected = '(12345|)';

    expectObservable(source).toBe(expected);
  });

  it('should stop producing when unsubscribed', () => {
    const source = generate(1, x => x < 4, x => x + 1);
    let count = 0;
    const subscriber = new Subscriber<number>(
      x => {
        count++;
        if (x == 2) {
          subscriber.unsubscribe();
        }
      }
    );
    source.subscribe(subscriber);
    expect(count).to.be.equal(2);
  });

  it('should accept a scheduler', () => {
    const source = generate({
      initialState: 1,
      condition: x => x < 4,
      iterate: x => x + 1,
      resultSelector: (x: number) => x,
      scheduler: rxTestScheduler
    });
    const expected = '(123|)';

    let count = 0;
    source.subscribe(x => count++);

    expect(count).to.be.equal(0);
    rxTestScheduler.flush();
    expect(count).to.be.equal(3);

    expectObservable(source).toBe(expected, { '1': 1, '2': 2, '3': 3 });
  });

  it('should allow minimal possible options', () => {
    const source = generate({
      initialState: 1,
      iterate: x => x * 2
    }).pipe(
      take(3)
    );
    const expected = '(124|)';

    expectObservable(source).toBe(expected, { '1': 1, '2': 2, '4': 4 });
  });

  it('should emit error if result selector throws', () => {
    const source = generate({
      initialState: 1,
      iterate: x => x * 2,
      resultSelector: err
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error if result selector throws on scheduler', () => {
    const source = generate({
      initialState: 1,
      iterate: x => x * 2,
      resultSelector: err,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error after first value if iterate function throws', () => {
    const source = generate({
      initialState: 1,
      iterate: err
    });
    const expected = '(1#)';

    expectObservable(source).toBe(expected, { '1': 1 });
  });

  it('should emit error after first value if iterate function throws on scheduler', () => {
    const source = generate({
      initialState: 1,
      iterate: err,
      scheduler: rxTestScheduler
    });
    const expected = '(1#)';

    expectObservable(source).toBe(expected, { '1': 1 });
  });

  it('should emit error if condition function throws', () => {
    const source = generate({
      initialState: 1,
      iterate: x => x + 1,
      condition: err
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });

  it('should emit error if condition function throws on scheduler', () => {
    const source = generate({
      initialState: 1,
      iterate: x => x + 1,
      condition: err,
      scheduler: rxTestScheduler
    });
    const expected = '(#)';

    expectObservable(source).toBe(expected);
  });
});
