/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { throwError } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {throwError} */
describe('throwError', () => {
  let rxTest: TestScheduler;

  beforeEach(() => {
    rxTest = new TestScheduler(observableMatcher);
  });

  it('should create a cold observable that just emits an error', () => {
    rxTest.run(({ expectObservable }) => {
      const expected = '#';
      const e1 = throwError(() => 'error');
      expectObservable(e1).toBe(expected);
    });
  });

  it('should emit one value', (done) => {
    let calls = 0;
    throwError(() => 'bad').subscribe({
      next: () => {
        done(new Error('should not be called'));
      },
      error: (err) => {
        expect(++calls).to.equal(1);
        expect(err).to.equal('bad');
        done();
      },
    });
  });

  it('should accept a factory function', () => {
    let calls = 0;
    const errors: any[] = [];

    const source = throwError(() => ({
      call: ++calls,
      message: 'LOL',
    }));

    source.subscribe({
      next: () => {
        throw new Error('this should not happen');
      },
      error: (err) => {
        errors.push(err);
      },
    });

    source.subscribe({
      next: () => {
        throw new Error('this should not happen');
      },
      error: (err) => {
        errors.push(err);
      },
    });

    expect(errors).to.deep.equal([
      {
        call: 1,
        message: 'LOL',
      },
      {
        call: 2,
        message: 'LOL',
      },
    ]);
  });
});
