import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;
const queueScheduler = Rx.Scheduler.queue;

/** @test {switch} */
describe('Observable.prototype.switch', () => {
  asDiagram('switch')('should switch a hot observable of cold observables', () => {
    const x = cold(    '--a---b--c---d--|      ');
    const y = cold(           '----e---f--g---|');
    const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
    const expected = '----a---b----e---f--g---|';

    expectObservable(e1.switch()).toBe(expected);
  });

  it('should switch to each immediately-scheduled inner Observable', (done: MochaDone) => {
    const a = Observable.of<number>(1, 2, 3, queueScheduler);
    const b = Observable.of<number>(4, 5, 6, queueScheduler);
    const r = [1, 4, 5, 6];
    let i = 0;
    Observable.of<Rx.Observable<number>>(a, b, queueScheduler)
      .switch()
      .subscribe((x: number) => {
        expect(x).to.equal(r[i++]);
      }, null, done);
  });

  it('should unsub inner observables', () => {
    const unsubbed = [];

    Observable.of('a', 'b', Rx.Scheduler.none).map((x: string) =>
      Observable.create((subscriber: Rx.Subscriber<string>) => {
        subscriber.complete();
        return () => {
          unsubbed.push(x);
        };
      }))
    .mergeAll()
    .subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch to each inner Observable', (done: MochaDone) => {
    const a = Observable.of(1, 2, 3, Rx.Scheduler.none);
    const b = Observable.of(4, 5, 6, Rx.Scheduler.none);
    const r = [1, 2, 3, 4, 5, 6];
    let i = 0;
    Observable.of(a, b, Rx.Scheduler.none).switch().subscribe((x: number) => {
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
      .mergeMap((x: string) => Observable.of(x, Rx.Scheduler.none))
      .switch()
      .mergeMap((x: any) => Observable.of(x, Rx.Scheduler.none));

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

  it('should handle an observable of promises', (done: MochaDone) => {
    const expected = [3];

    (<any>Observable.of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3), Rx.Scheduler.none))
      .switch()
      .subscribe((x: number) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should handle an observable of promises, where last rejects', (done: MochaDone) => {
    Observable.of<any>(Promise.resolve(1), Promise.resolve(2), Promise.reject(3), Rx.Scheduler.none)
      .switch()
      .subscribe(() => {
        done(new Error('should not be called'));
      }, (err: any) => {
        expect(err).to.equal(3);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should handle an observable with Arrays in it', () => {
    const expected = [1, 2, 3, 4];
    let completed = false;

    Observable.of<any>(Observable.never(), Observable.never(), [1, 2, 3, 4], Rx.Scheduler.none)
      .switch()
      .subscribe((x: number) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        completed = true;
        expect(expected.length).to.equal(0);
      });

    expect(completed).to.be.true;
  });
});