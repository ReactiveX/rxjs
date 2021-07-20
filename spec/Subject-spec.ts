import { expect } from 'chai';
import { Subject, ObjectUnsubscribedError, Observable, AsyncSubject, Observer, of, config, throwError, concat } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from './helpers/observableMatcher';

/** @test {Subject} */
describe('Subject', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should allow next with undefined or any when created with no type', (done) => {
    const subject = new Subject();
    subject.subscribe(
      (x) => {
        expect(x).to.be.a('undefined');
      },
      null,
      done
    );

    const data: any = undefined;
    subject.next(undefined);
    subject.next(data);
    subject.complete();
  });

  it('should allow empty next when created with void type', (done) => {
    const subject = new Subject<void>();
    subject.subscribe(
      (x) => {
        expect(x).to.be.a('undefined');
      },
      null,
      done
    );

    subject.next();
    subject.complete();
  });

  it('should pump values right on through itself', (done) => {
    const subject = new Subject<string>();
    const expected = ['foo', 'bar'];

    subject.subscribe(
      (x: string) => {
        expect(x).to.equal(expected.shift());
      },
      null,
      done
    );

    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should pump values to multiple subscribers', (done) => {
    const subject = new Subject<string>();
    const expected = ['foo', 'bar'];

    let i = 0;
    let j = 0;

    subject.subscribe(function (x) {
      expect(x).to.equal(expected[i++]);
    });

    subject.subscribe(
      function (x) {
        expect(x).to.equal(expected[j++]);
      },
      null,
      done
    );

    expect(subject.observers.length).to.equal(2);
    subject.next('foo');
    subject.next('bar');
    subject.complete();
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject does not complete', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe(
      function (x) {
        results1.push(x);
      },
      function (e) {
        results1.push('E');
      },
      () => {
        results1.push('C');
      }
    );

    subject.next(5);

    const subscription2 = subject.subscribe(
      function (x) {
        results2.push(x);
      },
      function (e) {
        results2.push('E');
      },
      () => {
        results2.push('C');
      }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.next(8);

    subscription2.unsubscribe();

    subject.next(9);
    subject.next(10);

    const subscription3 = subject.subscribe(
      function (x) {
        results3.push(x);
      },
      function (e) {
        results3.push('E');
      },
      () => {
        results3.push('C');
      }
    );

    subject.next(11);

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 8]);
    expect(results3).to.deep.equal([11]);
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject completes', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe(
      function (x) {
        results1.push(x);
      },
      function (e) {
        results1.push('E');
      },
      () => {
        results1.push('C');
      }
    );

    subject.next(5);

    const subscription2 = subject.subscribe(
      function (x) {
        results2.push(x);
      },
      function (e) {
        results2.push('E');
      },
      () => {
        results2.push('C');
      }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.complete();

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe(
      function (x) {
        results3.push(x);
      },
      function (e) {
        results3.push('E');
      },
      () => {
        results3.push('C');
      }
    );

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 'C']);
    expect(results3).to.deep.equal(['C']);
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject terminates with an error', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.next(4);

    const subscription1 = subject.subscribe(
      function (x) {
        results1.push(x);
      },
      function (e) {
        results1.push('E');
      },
      () => {
        results1.push('C');
      }
    );

    subject.next(5);

    const subscription2 = subject.subscribe(
      function (x) {
        results2.push(x);
      },
      function (e) {
        results2.push('E');
      },
      () => {
        results2.push('C');
      }
    );

    subject.next(6);
    subject.next(7);

    subscription1.unsubscribe();

    subject.error(new Error('err'));

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe(
      function (x) {
        results3.push(x);
      },
      function (e) {
        results3.push('E');
      },
      () => {
        results3.push('C');
      }
    );

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([5, 6, 7]);
    expect(results2).to.deep.equal([6, 7, 'E']);
    expect(results3).to.deep.equal(['E']);
  });

  it('should handle subscribers that arrive and leave at different times, ' + 'subject completes before nexting any value', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    const subscription1 = subject.subscribe(
      function (x) {
        results1.push(x);
      },
      function (e) {
        results1.push('E');
      },
      () => {
        results1.push('C');
      }
    );

    const subscription2 = subject.subscribe(
      function (x) {
        results2.push(x);
      },
      function (e) {
        results2.push('E');
      },
      () => {
        results2.push('C');
      }
    );

    subscription1.unsubscribe();

    subject.complete();

    subscription2.unsubscribe();

    const subscription3 = subject.subscribe(
      function (x) {
        results3.push(x);
      },
      function (e) {
        results3.push('E');
      },
      () => {
        results3.push('C');
      }
    );

    subscription3.unsubscribe();

    expect(results1).to.deep.equal([]);
    expect(results2).to.deep.equal(['C']);
    expect(results3).to.deep.equal(['C']);
  });

  it('should disallow new subscriber once subject has been disposed', () => {
    const subject = new Subject<number>();
    const results1: (number | string)[] = [];
    const results2: (number | string)[] = [];
    const results3: (number | string)[] = [];

    const subscription1 = subject.subscribe(
      function (x) {
        results1.push(x);
      },
      function (e) {
        results1.push('E');
      },
      () => {
        results1.push('C');
      }
    );

    subject.next(1);
    subject.next(2);

    const subscription2 = subject.subscribe(
      function (x) {
        results2.push(x);
      },
      function (e) {
        results2.push('E');
      },
      () => {
        results2.push('C');
      }
    );

    subject.next(3);
    subject.next(4);
    subject.next(5);

    subscription1.unsubscribe();
    subscription2.unsubscribe();
    subject.unsubscribe();

    expect(() => {
      subject.subscribe(
        function (x) {
          results3.push(x);
        },
        function (err) {
          expect(false).to.equal('should not throw error: ' + err.toString());
        }
      );
    }).to.throw(ObjectUnsubscribedError);

    expect(results1).to.deep.equal([1, 2, 3, 4, 5]);
    expect(results2).to.deep.equal([3, 4, 5]);
    expect(results3).to.deep.equal([]);
  });

  it('should not allow values to be nexted after it is unsubscribed', (done) => {
    const subject = new Subject<string>();
    const expected = ['foo'];

    subject.subscribe(function (x) {
      expect(x).to.equal(expected.shift());
    });

    subject.next('foo');
    subject.unsubscribe();
    expect(() => subject.next('bar')).to.throw(ObjectUnsubscribedError);
    done();
  });

  it('should clean out unsubscribed subscribers', (done) => {
    const subject = new Subject();

    const sub1 = subject.subscribe(function (x) {
      //noop
    });

    const sub2 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observers.length).to.equal(2);
    sub1.unsubscribe();
    expect(subject.observers.length).to.equal(1);
    sub2.unsubscribe();
    expect(subject.observers.length).to.equal(0);
    done();
  });

  it('should expose observed status', () => {
    const subject = new Subject();

    expect(subject.observed).to.equal(false);

    const sub1 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observed).to.equal(true);

    const sub2 = subject.subscribe(function (x) {
      //noop
    });

    expect(subject.observed).to.equal(true);
    sub1.unsubscribe();
    expect(subject.observed).to.equal(true);
    sub2.unsubscribe();
    expect(subject.observed).to.equal(false);
    subject.unsubscribe();
    expect(subject.observed).to.equal(false);
  });

  it('should have a static create function that works', () => {
    expect(Subject.create).to.be.a('function');
    const source = of(1, 2, 3, 4, 5);
    const nexts: number[] = [];
    const output: number[] = [];

    let error: any;
    let complete = false;
    let outputComplete = false;

    const destination = {
      closed: false,
      next: function (x: number) {
        nexts.push(x);
      },
      error: function (err: any) {
        error = err;
        this.closed = true;
      },
      complete: function () {
        complete = true;
        this.closed = true;
      },
    };

    const sub = Subject.create(destination, source);

    sub.subscribe(
      function (x: number) {
        output.push(x);
      },
      null,
      () => {
        outputComplete = true;
      }
    );

    sub.next('a');
    sub.next('b');
    sub.next('c');
    sub.complete();

    expect(nexts).to.deep.equal(['a', 'b', 'c']);
    expect(complete).to.be.true;
    expect(error).to.be.a('undefined');

    expect(output).to.deep.equal([1, 2, 3, 4, 5]);
    expect(outputComplete).to.be.true;
  });

  it('should have a static create function that works also to raise errors', () => {
    expect(Subject.create).to.be.a('function');
    const source = of(1, 2, 3, 4, 5);
    const nexts: number[] = [];
    const output: number[] = [];

    let error: any;
    let complete = false;
    let outputComplete = false;

    const destination = {
      closed: false,
      next: function (x: number) {
        nexts.push(x);
      },
      error: function (err: any) {
        error = err;
        this.closed = true;
      },
      complete: function () {
        complete = true;
        this.closed = true;
      },
    };

    const sub = Subject.create(destination, source);

    sub.subscribe(
      function (x: number) {
        output.push(x);
      },
      null,
      () => {
        outputComplete = true;
      }
    );

    sub.next('a');
    sub.next('b');
    sub.next('c');
    sub.error('boom');

    expect(nexts).to.deep.equal(['a', 'b', 'c']);
    expect(complete).to.be.false;
    expect(error).to.equal('boom');

    expect(output).to.deep.equal([1, 2, 3, 4, 5]);
    expect(outputComplete).to.be.true;
  });

  it('should be an Observer which can be given to Observable.subscribe', (done) => {
    const source = of(1, 2, 3, 4, 5);
    const subject = new Subject<number>();
    const expected = [1, 2, 3, 4, 5];

    subject.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      (x) => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );

    source.subscribe(subject);
  });

  it('should be usable as an Observer of a finite delayed Observable', (done) => {
    const source = of(1, 2, 3).pipe(delay(50));
    const subject = new Subject<number>();

    const expected = [1, 2, 3];

    subject.subscribe(
      function (x) {
        expect(x).to.equal(expected.shift());
      },
      (x) => {
        done(new Error('should not be called'));
      },
      () => {
        done();
      }
    );

    source.subscribe(subject);
  });

  it('should throw ObjectUnsubscribedError when emit after unsubscribed', () => {
    const subject = new Subject<string>();
    subject.unsubscribe();

    expect(() => {
      subject.next('a');
    }).to.throw(ObjectUnsubscribedError);

    expect(() => {
      subject.error('a');
    }).to.throw(ObjectUnsubscribedError);

    expect(() => {
      subject.complete();
    }).to.throw(ObjectUnsubscribedError);
  });

  it('should not next after completed', () => {
    const subject = new Subject<string>();
    const results: string[] = [];
    subject.subscribe(
      (x) => results.push(x),
      null,
      () => results.push('C')
    );
    subject.next('a');
    subject.complete();
    subject.next('b');
    expect(results).to.deep.equal(['a', 'C']);
  });

  it('should not next after error', () => {
    const error = new Error('wut?');
    const subject = new Subject<string>();
    const results: string[] = [];
    subject.subscribe(
      (x) => results.push(x),
      (err) => results.push(err)
    );
    subject.next('a');
    subject.error(error);
    subject.next('b');
    expect(results).to.deep.equal(['a', error]);
  });

  describe('asObservable', () => {
    it('should hide subject', () => {
      const subject = new Subject();
      const observable = subject.asObservable();

      expect(subject).not.to.equal(observable);

      expect(observable instanceof Observable).to.be.true;
      expect(observable instanceof Subject).to.be.false;
    });

    it('should handle subject never emits', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('-').asObservable();

        expectObservable(observable).toBe('-');
      });
    });

    it('should handle subject completes without emits', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('--^--|').asObservable();
        const expected = '        ---|';

        expectObservable(observable).toBe(expected);
      });
    });

    it('should handle subject throws', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('--^--#').asObservable();
        const expected = '        ---#';

        expectObservable(observable).toBe(expected);
      });
    });

    it('should handle subject emits', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const observable = hot('--^--x--|').asObservable();
        const expected = '        ---x--|';

        expectObservable(observable).toBe(expected);
      });
    });

    it('should work with inherited subject', () => {
      const results: (number | string)[] = [];
      const subject = new AsyncSubject<number>();

      subject.next(42);
      subject.complete();

      const observable = subject.asObservable();

      observable.subscribe(
        (x) => results.push(x),
        null,
        () => results.push('done')
      );

      expect(results).to.deep.equal([42, 'done']);
    });
  });

  describe('error thrown scenario', () => {
    afterEach(() => {
      config.onUnhandledError = null;
    });

    it('should not synchronously error when nexted into', (done) => {
      config.onUnhandledError = (err) => {
        expect(err.message).to.equal('Boom!');
        done();
      };
      
      const source = new Subject<number>();
      source.subscribe();
      source.subscribe(() => {
        throw new Error('Boom!');
      });
      source.subscribe();
      try {
        source.next(42);
      } catch (err) {
        // This should not happen!
        expect(true).to.be.false;
      }
      expect(true).to.be.true;
    });
  });
});

describe('AnonymousSubject', () => {
  it('should be exposed', () => {
    expect(AnonymousSubject).to.be.a('function');
  });

  it('should not be eager', () => {
    let subscribed = false;

    const subject = Subject.create(
      null,
      new Observable((observer: Observer<any>) => {
        subscribed = true;
        const subscription = of('x').subscribe(observer);
        return () => {
          subscription.unsubscribe();
        };
      })
    );

    const observable = subject.asObservable();
    expect(subscribed).to.be.false;

    observable.subscribe();
    expect(subscribed).to.be.true;
  });
});

describe('useDeprecatedSynchronousErrorHandling', () => {
  beforeEach(() => {
    config.useDeprecatedSynchronousErrorHandling = true;
  });

  afterEach(() => {
    config.useDeprecatedSynchronousErrorHandling = false;
  });

  it('should throw an error when nexting with a flattened, erroring inner observable', () => {
    const subject = new Subject<string>();
    subject.pipe(mergeMap(() => throwError(() => new Error('bad')))).subscribe();

    expect(() => {
      subject.next('wee');
    }).to.throw(Error, 'bad');
  });

  it('should throw an error when nexting with a flattened, erroring inner observable with more than one operator', () => {
    const subject = new Subject<string>();
    subject.pipe(mergeMap(() => throwError(() => new Error('bad'))), map(x => x)).subscribe();

    expect(() => {
      subject.next('wee');
    }).to.throw(Error, 'bad');
  });

  it('should throw an error when notifying an error with catchError returning an erroring inner observable', () => {
    const subject = new Subject<string>();
    subject.pipe(catchError(() => throwError(() => new Error('bad')))).subscribe();

    expect(() => {
      subject.error('wee');
    }).to.throw(Error, 'bad');
  });

  it('should throw an error when nexting with an operator that errors synchronously', () => {
    const subject = new Subject<string>();
    subject.pipe(mergeMap(() => {
      throw new Error('lol');
    })).subscribe();

    expect(() => {
      subject.next('wee');
    }).to.throw(Error, 'lol');
  });

  
  it('should throw an error when notifying an error with a catchError that errors synchronously', () => {
    const subject = new Subject<string>();
    subject.pipe(catchError(() => {
      throw new Error('lol');
    })).subscribe();

    expect(() => {
      subject.error('wee');
    }).to.throw(Error, 'lol');
  });

  it('should throw an error when nexting with an erroring next handler', () => {
    const subject = new Subject<string>();
    subject.subscribe(() => {
      throw new Error('lol');
    });

    expect(() => {
      subject.next('wee');
    }).to.throw(Error, 'lol');
  });

  it('should throw an error when notifying with an erroring error handler', () => {
    const subject = new Subject<string>();
    subject.subscribe({
      error: () => {
        throw new Error('lol');
      }
    });

    expect(() => {
      subject.error('wee');
    }).to.throw(Error, 'lol');
  });

  it('should throw an error when notifying with an erroring complete handler', () => {
    const subject = new Subject<string>();
    subject.subscribe({
      complete: () => {
        throw new Error('lol');
      }
    });

    expect(() => {
      subject.complete();
    }).to.throw(Error, 'lol');
  });

  it('should throw an error when notifying an complete, and concatenated with another observable that synchronously errors', () => {
    const subject = new Subject<string>();
    concat(subject, throwError(new Error('lol'))).subscribe();

    expect(() => {
      subject.complete();
    }).to.throw(Error, 'lol');
  });

  it('should not throw on second error passed', () => {
    const subject = new Subject();

    subject.subscribe();
    
    expect(() => {
      subject.error(new Error('one'));
    }).to.throw(Error, 'one');

    expect(() => {
      subject.error(new Error('two'));
    }).not.to.throw(Error, 'two');
  });

  it('should not throw on second error passed, even after having been operated on', () => {
    const subject = new Subject();

    subject.pipe(mergeMap(x => [x])).subscribe();
    
    expect(() => {
      subject.error(new Error('one'));
    }).to.throw(Error, 'one');

    expect(() => {
      subject.error('two');
    }).not.to.throw();
  });

  it('deep rethrowing 1', () => {
    const subject1 = new Subject();
    const subject2 = new Subject();

    subject2.subscribe();

    subject1.subscribe({
      next: () => subject2.error(new Error('hahaha'))
    });

    expect(() => {
      subject1.next('test');
    }).to.throw(Error, 'hahaha');
  });

  it('deep rethrowing 2', () => {
    const subject1 = new Subject();

    subject1.subscribe({
      next: () => {
        throwError(new Error('hahaha')).subscribe();
      }
    });

    expect(() => {
      subject1.next('test');
    }).to.throw(Error, 'hahaha');
  });
});