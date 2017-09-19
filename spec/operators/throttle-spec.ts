import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {throttle} */
describe('Observable.prototype.throttle', () =>  {
  asDiagram('throttle')('should immediately emit the first value in each time window', () =>  {
    const e1 =   hot('-a-xy-----b--x--cxxx-|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----|                ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-a--------b-----c----|';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should simply mirror the source if values are not emitted often enough', () =>  {
    const e1 =   hot('-a--------b-----c----|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----|                ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-a--------b-----c----|';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should throttle with duration Observable using next to close the duration', () =>  {
    const e1 =   hot('-a-xy-----b--x--cxxx-|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----x-y-z            ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-a--------b-----c----|';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should interrupt source and duration when result is unsubscribed early', () =>  {
    const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
    const unsub =    '              !               ';
    const e1subs =   '^             !               ';
    const e2 =  cold( '------------------|          ');
    const e2subs =   ' ^            !               ';
    const expected = '-a-------------               ';

    const result = e1.throttle(() =>  e2);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () =>  {
    const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
    const e1subs =   '^             !               ';
    const e2 =  cold( '------------------|          ');
    const e2subs =   ' ^            !               ';
    const expected = '-a-------------               ';
    const unsub =    '              !               ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .throttle(() =>  e2)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', () =>  {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                        !';
    const e2 =  cold('-----|                    ');
    const e2subs =  ['^    !                    ',
                   '      ^    !              ',
                   '            ^    !        ',
                   '                  ^    !  ',
                   '                        ^!'];
    const expected = 'a-----a-----a-----a-----a|';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should mirror source if durations are always empty', () =>  {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                        !';
    const e2 =  cold('|');
    const expected = 'abcdefabcdefabcdefabcdefa|';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take only the first value emitted if duration is a never', () =>  {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                            !';
    const e2 =  cold('-');
    const e2subs =   '    ^                        !';
    const expected = '----a------------------------|';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe duration Observable when source raise error', () =>  {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa#');
    const e1subs =   '^                            !';
    const e2 =  cold('-');
    const e2subs =   '    ^                        !';
    const expected = '----a------------------------#';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error as soon as just-throw duration is used', () =>  {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^   !                         ';
    const e2 =  cold('#');
    const e2subs =   '    (^!)                      ';
    const expected = '----(a#)                      ';

    const result = e1.throttle(() =>  e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should throttle using durations of constying lengths', () =>  {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^                     !   ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------|        '),
              cold(                  '--|     '),
              cold(                     '----|')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                ',
                   '          ^      !        ',
                   '                  ^ !     ',
                   '                     ^!   '];
    const expected = 'a-----a---a-------a--a|   ';

    let i = 0;
    const result = e1.throttle(() =>  e2[i++]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should propagate error from duration Observable', () =>  {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^                !        ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------#        ')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                ',
                   '          ^      !        '];
    const expected = 'a-----a---a------#        ';

    let i = 0;
    const result = e1.throttle(() =>  e2[i++]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should propagate error thrown from durationSelector function', () =>  {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^         !               ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------|        ')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                '];
    const expected = 'a-----a---#               ';

    let i = 0;
    const result = e1.throttle(() =>  {
      if (i === 2) {
        throw 'error';
      }
      return e2[i++];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2subs.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should complete when source does not emit', () =>  {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.throttle(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () =>  {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.throttle(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () =>  {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.throttle(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () =>  {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.throttle(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () =>  {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.throttle(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle by promise resolves', (done: MochaDone) => {
    const e1 = Observable.concat(Observable.of(1),
      Observable.timer(10).mapTo(2),
      Observable.timer(10).mapTo(3),
      Observable.timer(50).mapTo(4)
    );
    const expected = [1, 2, 3, 4];

    e1.throttle(() =>  {
      return new Promise((resolve: any) => { resolve(42); });
    }).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift()); },
      () =>  {
        done(new Error('should not be called'));
      },
      () =>  {
        expect(expected.length).to.equal(0);
        done();
      }
    );
  });

  it('should raise error when promise rejects', (done: MochaDone) => {
    const e1 = Observable.concat(Observable.of(1),
      Observable.timer(10).mapTo(2),
      Observable.timer(10).mapTo(3),
      Observable.timer(50).mapTo(4)
    );
    const expected = [1, 2, 3];
    const error = new Error('error');

    e1.throttle((x: number) => {
      if (x === 3) {
        return new Promise((resolve: any, reject: any) => { reject(error); });
      } else {
        return new Promise((resolve: any) => { resolve(42); });
      }
    }).subscribe(
      (x: number) => {
        expect(x).to.equal(expected.shift()); },
      (err: any) => {
        expect(err).to.be.an('error', 'error');
        expect(expected.length).to.equal(0);
        done();
      },
      () =>  {
        done(new Error('should not be called'));
      }
    );
  });

  describe('throttle(fn, { leading: true, trailing: true })', () => {
    asDiagram('throttle(fn, { leading: true, trailing: true })')('should immediately emit the first value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx--|');
      const e1subs =   '^                     !';
      const e2 =  cold( '----|                 ');
      const e2subs =  [' ^   !                 ',
                       '          ^   !        ',
                       '                ^   !  '];
      const expected = '-a---y----b---x-c---x-|';

      const result = e1.throttle(() =>  e2, { leading: true, trailing: true });

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  describe('throttle(fn, { leading: false, trailing: true })', () => {
    asDiagram('throttle(fn, { leading: false, trailing: true })')('should immediately emit the first value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx--|');
      const e1subs =   '^                     !';
      const e2 =  cold( '----|                 ');
      const e2subs =  [' ^   !                 ',
                       '          ^   !        ',
                       '                ^   !  '];
      const expected = '-----y--------x-----x-|';

      const result = e1.throttle(() =>  e2, { leading: false, trailing: true });

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
