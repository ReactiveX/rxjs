import { of } from './of';
import { expect } from 'chai';
import { asapScheduler } from '../scheduler/asapScheduler';

describe('of', () => {
  it('should handle no arguments passed', () => {
    const source = of();
    let nexted = false;
    let completed = false;
    source.subscribe({
      next() { nexted = true; },
      complete() { completed = true; },
    });
    expect(completed).to.be.true;
    expect(nexted).to.be.false;
  });

  it('should emit values and complete synchronously if not scheduled', () => {
    const source = of(1, 2, 3);
    const results: any[] = [];
    results.push('start');
    source.subscribe({
      next(value) { results.push(value) },
      complete() { results.push('done') },
    });
    results.push('stop');
    expect(results).to.deep.equal(['start', 1, 2, 3, 'done', 'stop']);
  });

  it('should emit values asynchronously if scheduled', (done) => {
    const source = of(1, 2, 3);
    const results: any[] = [];
    results.push('start');
    source.subscribe({
      next(value) { results.push(value) },
      complete() {
        results.push('done');
        try {
          expect(results).to.deep.equal(['start', 'stop', 1, 2, 3, 'done']);
        } catch (err) {
          done(err);
          return;
        }
        done();
      },
    }, asapScheduler);
    results.push('stop');
  });

  it('should not complete after early unsubscribe', () => {
    const source = of(1, 2, 3);
    source.subscribe({
      next(value, subscription) {
        if (value === 2) subscription.unsubscribe();
      },
      complete() {
        throw new Error('should not be called');
      }
    })
  });
});
