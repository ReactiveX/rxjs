import * as Rx from '../../dist/cjs/Rx';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, DoneSignature, asDiagram} from '../helpers/test-helper';

const Observable = Rx.Observable;
const queueScheduler = Rx.Scheduler.queue;

describe('Observable.prototype.switch()', () => {
  asDiagram('switch')('should switch a hot observable of cold observables', () => {
    const x = cold(    '--a---b--c---d--|      ');
    const y = cold(           '----e---f--g---|');
    const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
    const expected = '----a---b----e---f--g---|';

    expectObservable(e1.switch()).toBe(expected);
  });

  it('should switch to each immediately-scheduled inner Observable', (done: DoneSignature) => {
    const a = Observable.of<number>(1, 2, 3, queueScheduler);
    const b = Observable.of<number>(4, 5, 6, queueScheduler);
    const r = [1, 4, 5, 6];
    let i = 0;
    Observable.of<Rx.Observable<number>>(a, b, queueScheduler)
      .switch()
      .subscribe((x: number) => {
        expect(x).toBe(r[i++]);
      }, null, done);
  });

  it('should unsub inner observables', () => {
    const unsubbed = [];

    Observable.of('a', 'b').map((x: string) =>
      Observable.create((subscriber: Rx.Subscriber<string>) => {
        subscriber.complete();
        return () => {
          unsubbed.push(x);
        };
      }))
    .mergeAll()
    .subscribe();

    expect(unsubbed).toEqual(['a', 'b']);
  });

  it('should switch to each inner Observable', (done: DoneSignature) => {
    const a = Observable.of(1, 2, 3);
    const b = Observable.of(4, 5, 6);
    const r = [1, 2, 3, 4, 5, 6];
    let i = 0;
    Observable.of(a, b).switch().subscribe((x: number) => {
      expect(x).toBe(r[i++]);
    }, null, done);
  });

  it('should handle a hot observable of observables', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^       !              ';
    const y = cold(                '---d--e---f---|');
    const ysubs =    '              ^             !';
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---b----d--e---f---|';
    expectObservable(e1.switch()).toBe(expected);
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
    expectObservable(e1.switch(), unsub).toBe(expected);
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

    const result = (<any>e1)
      .mergeMap((x: string) => Observable.of(x))
      .switch()
      .mergeMap((x: any) => Observable.of(x));

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
    expectObservable(e1.switch()).toBe(expected);
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
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, one inner throws', () => {
    const x = cold(        '--a---#                ');
    const xsubs =    '      ^     !                ';
    const y = cold(                '---d--e---f---|');
    const ysubs = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---#                ';
    expectObservable(e1.switch()).toBe(expected);
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
    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle an empty hot observable', () => {
    const e1 =   hot('------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never hot observable', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete not before the outer completes', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      ^            !   ';
    const e1 = hot(  '------x---------------|', { x: x });
    const e1subs =   '^                     !';
    const expected = '--------a---b---c-----|';

    expectObservable(e1.switch()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an observable of promises', (done: DoneSignature) => {
    const expected = [3];

    (<any>Observable.of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)))
      .switch()
      .subscribe((x: number) => {
        expect(x).toBe(expected.shift());
      }, null, () => {
        expect(expected.length).toBe(0);
        done();
      });
  });

  it('should handle an observable of promises, where one rejects', (done: DoneSignature) => {
    Observable.of<any>(Promise.resolve(1), Promise.reject(2), Promise.resolve(3))
      .switch()
      .subscribe((x: number) => {
        expect(x).toBe(3);
      }, (err: any) => {
        expect(err).toBe(2);
      }, () => {
        done();
      });
  });

  it('should handle an observable with Arrays in it', () => {
    const expected = [1, 2, 3, 4];
    let completed = false;

    Observable.of<any>(Observable.never(), Observable.never(), [1, 2, 3, 4])
      .switch()
      .subscribe((x: number) => {
        expect(x).toBe(expected.shift());
      }, null, () => {
        completed = true;
        expect(expected.length).toBe(0);
      });

    expect(completed).toBe(true);
  });
});