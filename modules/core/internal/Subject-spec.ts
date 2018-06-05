import { Subject, of } from 'rxjs';
import { expect } from 'chai';

describe('Subject', () => {
  it('should do subject things', () => {
    const results1: any[] = [];
    const results2: any[] = [];
    const s = new Subject();

    s.subscribe({
      next(value) { results1.push(value); },
      complete() { results1.push('done') },
    });

    expect(results1).to.deep.equal([]);

    s.next(1);
    s.next(2);

    s.subscribe({
      next(value) { results2.push(value); },
      complete() { results2.push('done') },
    });

    expect(results2).to.deep.equal([]);

    s.next(3);
    s.complete();
    s.next(4);

    expect(results1).to.deep.equal([1, 2, 3, 'done']);
    expect(results2).to.deep.equal([3, 'done']);
  });

  it('should emit the error if subscribed to after an error', () => {
    const s = new Subject();
    s.error(new Error('bad'));

    let error: any;
    s.subscribe({
      error(err) {
        error = err;
      }
    });

    expect(error).to.be.an.instanceof(Error);
    expect(error.message).to.equal('bad');
  });

  describe('called with observer and observable', () => {
    it('should glue them together into a FrankenSubject', () => {
      const results: any[] = [];
      const observer = {
        next(value: any) { this.observed.push('next', value); },
        error(err: any) { this.observed.push('error', err); },
        complete() { this.observed.push('done'); },
        observed: [] as any[],
      };

      const observable = of(1, 2, 3);

      const frankenSubject = Subject(observer, observable);

      frankenSubject.subscribe({
        next(value) { results.push(value); },
        complete() { results.push('done'); },
      });

      frankenSubject.next(4);
      frankenSubject.next(5);
      frankenSubject.next(6);

      expect(observer.observed).to.deep.equal(['next', 4, 'next', 5, 'next', 6]);

      frankenSubject.complete();
      expect(observer.observed).to.deep.equal(['next', 4, 'next', 5, 'next', 6, 'done']);

      expect(results).to.deep.equal([1, 2, 3, 'done']);
    });
  });
});
