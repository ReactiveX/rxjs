import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { Observable, of, NEVER, queueScheduler, Subject } from 'rxjs';
import { map, switchAll, mergeMap } from 'rxjs/operators';

declare function asDiagram(arg: string): Function;
declare const type: Function;

/** @test {switch} */
describe('switchAll', () => {
  asDiagram('switchAll')('should switch a hot observable of cold observables', () => {
    const x = cold(    '--a---b--c---d--|      ');
    const y = cold(           '----e---f--g---|');
    const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
    const expected = '----a---b----e---f--g---|';

    expectObservable(e1.pipe(switchAll())).toBe(expected);
  });

  it('should switch to each immediately-scheduled inner Observable', (done) => {
    const a = of<number>(1, 2, 3, queueScheduler);
    const b = of<number>(4, 5, 6, queueScheduler);
    const r = [1, 4, 5, 6];
    let i = 0;
    of(a, b, queueScheduler)
      .pipe(switchAll())
      .subscribe((x) => {
        expect(x).to.equal(r[i++]);
      }, null, done);
  });

  it('should unsub inner observables', () => {
    const unsubbed: string[] = [];

    of('a', 'b').pipe(
      map((x) => new Observable<string>((subscriber) => {
        subscriber.complete();
        return () => {
          unsubbed.push(x);
        };
      })),
      switchAll()
    ).subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch to each inner Observable', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6);
    const r = [1, 2, 3, 4, 5, 6];
    let i = 0;
    of(a, b).pipe(switchAll()).subscribe((x) => {
      expect(x).to.equal(r[i++]);
    }, null, done);
  });

  it('should handle a hot observable of observables', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^       !              ';
    const y = cold(                '---d--e---f---|');
    const ysubs =    '              ^             !';
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---b----d--e---f---|';
    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^       !              ';
    const y = cold(                '---d--e---f---|');
    const ysubs =    '              ^ !            ';
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const unsub =    '                !            ';
    const expected = '--------a---b---             ';
    expectObservable(e1.pipe(switchAll()), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^       !              ';
    const y = cold(                '---d--e---f---|');
    const ysubs =    '              ^ !            ';
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---b----            ';
    const unsub =    '                !            ';

    const result = e1.pipe(
      mergeMap((x) => of(x)),
      switchAll(),
      mergeMap((x) => of(x)),
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, inner never completes', () => {
    const x = cold(        '--a---b---c--|          ');
    const xsubs =    '      ^       !               ';
    const y = cold(                '---d--e---f-----');
    const ysubs =    '              ^               ';
    const e1 = hot(  '------x-------y------|        ', { x: x, y: y });
    const expected = '--------a---b----d--e---f-----';
    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a synchronous switch to the second inner observable', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      (^!)             ';
    const y = cold(        '---d--e---f---|  ');
    const ysubs =    '      ^             !  ';
    const e1 = hot(  '------(xy)------------|', { x: x, y: y });
    const expected = '---------d--e---f-----|';
    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, one inner throws', () => {
    const x = cold(        '--a---#                ');
    const xsubs =    '      ^     !                ';
    const y = cold(                '---d--e---f---|');
    const ysubs: string[] = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---#                ';
    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer throws', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^       !              ';
    const y = cold(                '---d--e---f---|');
    const ysubs =    '              ^       !      ';
    const e1 = hot(  '------x-------y-------#      ', { x: x, y: y });
    const expected = '--------a---b----d--e-#      ';
    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle an empty hot observable', () => {
    const e1 =   hot('------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never hot observable', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete not before the outer completes', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      ^            !   ';
    const e1 = hot(  '------x---------------|', { x: x });
    const e1subs =   '^                     !';
    const expected = '--------a---b---c-----|';

    expectObservable(e1.pipe(switchAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an observable of promises', (done) => {
    const expected = [3];

    of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3))
      .pipe(switchAll())
      .subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should handle an observable of promises, where last rejects', (done) => {
    of<Promise<number>>(Promise.resolve(1), Promise.resolve(2), Promise.reject(3))
      .pipe(switchAll())
      .subscribe(() => {
        done(new Error('should not be called'));
      }, (err) => {
        expect(err).to.equal(3);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should handle an observable with Arrays in it', () => {
    const expected = [1, 2, 3, 4];
    let completed = false;

    of<any>(NEVER, NEVER, [1, 2, 3, 4])
      .pipe(switchAll())
      .subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        completed = true;
        expect(expected.length).to.equal(0);
      });

    expect(completed).to.be.true;
  });

  it('should not leak when child completes before each switch (prevent memory leaks #2355)', () => {
    let iStream: Subject<number>;
    const oStreamControl = new Subject<number>();
    const oStream = oStreamControl.pipe(
      map(() => (iStream = new Subject<number>()))
    );
    const switcher = oStream.pipe(switchAll());
    const result: number[] = [];
    let sub = switcher.subscribe((x) => result.push(x));

    [0, 1, 2, 3, 4].forEach((n) => {
      oStreamControl.next(n); // creates inner
      iStream.complete();
    });
    // Expect one child of switch(): The oStream
    expect(
      (<any>sub)._subscriptions[0]._subscriptions.length
    ).to.equal(1);
    sub.unsubscribe();
  });

  it('should not leak if we switch before child completes (prevent memory leaks #2355)', () => {
    const oStreamControl = new Subject<number>();
    const oStream = oStreamControl.pipe(
      map(() => new Subject<number>())
    );
    const switcher = oStream.pipe(switchAll());
    const result: number[] = [];
    let sub = switcher.subscribe((x) => result.push(x));

    [0, 1, 2, 3, 4].forEach((n) => {
      oStreamControl.next(n); // creates inner
    });
    // Expect one child of switch(): The oStream
    expect(
      (sub as any)._subscriptions[0]._subscriptions.length
    ).to.equal(1);
    // Expect two children of subscribe(): The destination and the first inner
    // See #4106 - inner subscriptions are now added to destinations
    expect(
      (sub as any)._subscriptions.length
    ).to.equal(2);
    sub.unsubscribe();
  });
});
