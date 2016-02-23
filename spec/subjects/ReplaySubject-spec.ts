import * as Rx from '../../dist/cjs/Rx';
import {TestScheduler} from '../../dist/cjs/testing/TestScheduler';
declare const {hot, expectObservable};
import {DoneSignature} from '../helpers/test-helper';

declare const rxTestScheduler: TestScheduler;

const ReplaySubject = Rx.ReplaySubject;
const Observable = Rx.Observable;

/** @test {ReplaySubject} */
describe('ReplaySubject', () => {
  it('should extend Subject', (done: DoneSignature) => {
    const subject = new ReplaySubject();
    expect(subject instanceof Rx.Subject).toBe(true);
    done();
  });

  it('should replay values upon subscription', (done: DoneSignature) => {
    const subject = new ReplaySubject();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((x: number) => {
      expect(x).toBe(expects[i++]);
      if (i === 3) {
        subject.complete();
      }
    }, (err: any) => {
      done.fail('should not be called');
    }, done);
  });

  it('should replay values and complete', (done: DoneSignature) => {
    const subject = new ReplaySubject();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.complete();
    subject.subscribe((x: number) => {
      expect(x).toBe(expects[i++]);
    }, null, done);
  });

  it('should replay values and error', (done: DoneSignature) => {
    const subject = new ReplaySubject();
    const expects = [1, 2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.error('fooey');
    subject.subscribe((x: number) => {
      expect(x).toBe(expects[i++]);
    }, (err: any) => {
      expect(err).toBe('fooey');
      done();
    });
  });

  it('should only replay values within its buffer size', (done: DoneSignature) => {
    const subject = new ReplaySubject(2);
    const expects = [2, 3];
    let i = 0;
    subject.next(1);
    subject.next(2);
    subject.next(3);
    subject.subscribe((x: number) => {
      expect(x).toBe(expects[i++]);
      if (i === 2) {
        subject.complete();
      }
    }, (err: any) => {
      done.fail('should not be called');
    }, done);
  });

  describe('with bufferSize=2', () => {
    it('should replay 2 previous values when subscribed', () => {
      const replaySubject = new ReplaySubject(2);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3----4------5-6---7--8----9--|';
      const subscriber1 = hot('      (a|)                         ').mergeMapTo(replaySubject);
      const unsub1 =          '                     !             ';
      const expected1   =     '      (23)4------5-6--             ';
      const subscriber2 = hot('            (b|)                   ').mergeMapTo(replaySubject);
      const unsub2 =          '                         !         ';
      const expected2   =     '            (34)-5-6---7--         ';
      const subscriber3 = hot('                           (c|)    ').mergeMapTo(replaySubject);
      const expected3   =     '                           (78)9--|';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });

    it('should replay 2 last values for when subscribed after completed', () => {
      const replaySubject = new ReplaySubject(2);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3--4--|';
      const subscriber1 = hot('               (a|) ').mergeMapTo(replaySubject);
      const expected1   =     '               (34|)';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });

    it('should handle subscribers that arrive and leave at different times, ' +
    'subject does not complete', () => {
      const subject = new ReplaySubject(2);
      const results1 = [];
      const results2 = [];
      const results3 = [];

      subject.next(1);
      subject.next(2);
      subject.next(3);
      subject.next(4);

      const subscription1 = subject.subscribe(
        (x: number) => { results1.push(x); },
        (err: any) => { results1.push('E'); },
        () => { results1.push('C'); }
      );

      subject.next(5);

      const subscription2 = subject.subscribe(
        (x: number) => { results2.push(x); },
        (err: any) => { results2.push('E'); },
        () => { results2.push('C'); }
      );

      subject.next(6);
      subject.next(7);

      subscription1.unsubscribe();

      subject.next(8);

      subscription2.unsubscribe();

      subject.next(9);
      subject.next(10);

      const subscription3 = subject.subscribe(
        (x: number) => { results3.push(x); },
        (err: any) => { results3.push('E'); },
        () => { results3.push('C'); }
      );

      subject.next(11);

      subscription3.unsubscribe();

      expect(results1).toEqual([3, 4, 5, 6, 7]);
      expect(results2).toEqual([4, 5, 6, 7, 8]);
      expect(results3).toEqual([9, 10, 11]);

      subject.complete();
    });
  });

  describe('with windowTime=40', () => {
    it('should replay previous values since 40 time units ago when subscribed', () => {
      const replaySubject = new ReplaySubject(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3----4------5-6----7-8----9--|';
      const subscriber1 = hot('      (a|)                         ').mergeMapTo(replaySubject);
      const unsub1 =          '                     !             ';
      const expected1   =     '      (23)4------5-6--             ';
      const subscriber2 = hot('            (b|)                   ').mergeMapTo(replaySubject);
      const unsub2 =          '                         !         ';
      const expected2   =     '            4----5-6----7-         ';
      const subscriber3 = hot('                           (c|)    ').mergeMapTo(replaySubject);
      const expected3   =     '                           (78)9--|';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1, unsub1).toBe(expected1);
      expectObservable(subscriber2, unsub2).toBe(expected2);
      expectObservable(subscriber3).toBe(expected3);
    });

    it('should replay last values since 40 time units ago when subscribed', () => {
      const replaySubject = new ReplaySubject(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
      function feedNextIntoSubject(x) { replaySubject.next(x); }
      function feedErrorIntoSubject(err) { replaySubject.error(err); }
      function feedCompleteIntoSubject() { replaySubject.complete(); }

      const sourceTemplate =  '-1-2-3----4|';
      const subscriber1 = hot('             (a|)').mergeMapTo(replaySubject);
      const expected1   =     '             (4|)';

      expectObservable(hot(sourceTemplate).do(
        feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject
      )).toBe(sourceTemplate);
      expectObservable(subscriber1).toBe(expected1);
    });
  });

  it('should be an Observer which can be given to Observable.subscribe', (done: DoneSignature) => {
    const source = Observable.of(1, 2, 3, 4, 5);
    const subject = new ReplaySubject(3);
    const expected = [3, 4, 5];

    source.subscribe(subject);

    subject.subscribe(
      (x: number) => {
        expect(x).toBe(expected.shift());
      },
      done.fail,
      done
    );
  });
});