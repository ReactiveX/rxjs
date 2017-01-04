import * as Rx from '../../dist/cjs/Rx';
import { expect } from 'chai';

declare const {hot, asDiagram, expectObservable, expectSubscriptions};

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {observeOn} */
describe('Observable.prototype.observeOn', () => {
  asDiagram('observeOn(scheduler)')('should observe on specified scheduler', () => {
    const e1 =    hot('--a--b--|');
    const expected =  '--a--b--|';
    const sub =       '^       !';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe after specified delay', () => {
    const e1 =    hot('--a--b--|');
    const expected =  '-----a--b--|';
    const sub =       '^          !';

    expectObservable(e1.observeOn(rxTestScheduler, 30)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source raises error', () => {
    const e1 =    hot('--a--#');
    const expected =  '--a--#';
    const sub =       '^    !';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source is empty', () => {
    const e1 =    hot('-----|');
    const expected =  '-----|';
    const sub =       '^    !';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source does not complete', () => {
    const e1 =    hot('-----');
    const expected =  '-----';
    const sub =       '^    ';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1.observeOn(rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .observeOn(rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should clean up subscriptions created by async scheduling (prevent memory leaks #2244)', (done) => {
    //HACK: Deep introspection to make sure we're cleaning up notifications in scheduling.
    // as the architecture changes, this test may become brittle.
    const results = [];
    const subscription: any = new Observable(observer => {
      let i = 1;
      const id = setInterval(() => {
        if (i > 3) {
          observer.complete();
        } else {
          observer.next(i++);
        }
      }, 0);

      return () => clearInterval(id);
    })
      .observeOn(Rx.Scheduler.asap)
      .subscribe(
        x => {
          const observeOnSubscriber = subscription._subscriptions[0]._innerSub;
          expect(observeOnSubscriber._subscriptions.length).to.equal(2); // 1 for the consumer, and one for the notification
          expect(observeOnSubscriber._subscriptions[1]._innerSub.state.notification.kind)
            .to.equal('N');
          expect(observeOnSubscriber._subscriptions[1]._innerSub.state.notification.value)
            .to.equal(x);
          results.push(x);
        },
        err => done(err),
        () => {
          // now that the last nexted value is done, there should only be a complete notification scheduled
          const observeOnSubscriber = subscription._subscriptions[0]._innerSub;
          expect(observeOnSubscriber._subscriptions.length).to.equal(2); // 1 for the consumer, one for the complete notification
          // only this completion notification should remain.
          expect(observeOnSubscriber._subscriptions[1]._innerSub.state.notification.kind)
            .to.equal('C');
          // After completion, the entire _subscriptions list is nulled out anyhow, so we can't test much further than this.
          expect(results).to.deep.equal([1, 2, 3]);
          done();
        }
      );
  });
});
