import * as Rx from '../../dist/cjs/Rx';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, DoneSignature, asDiagram} from '../helpers/test-helper';

const Observable = Rx.Observable;

describe('Observable.prototype.inspect()', () => {
  asDiagram('inspect')('should emit the last value in each time window', () => {
    const e1 =   hot('-a-xy-----b--x--cxxx-|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----|                ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-----y--------x-----x|';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should delay the source if values are not emitted often enough', () => {
    const e1 =   hot('-a--------b-----c----|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----|                ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-----a--------b-----c|';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should inspect with duration Observable using next to close the duration', () => {
    const e1 =   hot('-a-xy-----b--x--cxxx-|');
    const e1subs =   '^                    !';
    const e2 =  cold( '----x-y-z            ');
    const e2subs =  [' ^   !                ',
                   '          ^   !       ',
                   '                ^   ! '];
    const expected = '-----y--------x-----x|';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should interrupt source and duration when result is unsubscribed early', () => {
    const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
    const unsub =    '              !               ';
    const e1subs =   '^             !               ';
    const e2 =  cold( '-----x------------|          ');
    const e2subs =  [' ^    !                       ',
                   '       ^    !                 ',
                   '             ^!               '];
    const expected = '------y-----z--               ';

    const result = e1.inspect(() => e2);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
    const e1subs =   '^             !               ';
    const e2 =  cold( '-----x------------|          ');
    const e2subs =  [' ^    !                       ',
                   '       ^    !                 ',
                   '             ^!               '];
    const expected = '------y-----z--               ';
    const unsub =    '              !               ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .inspect(() => e2)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                        !';
    const e2 =  cold('-----|                    ');
    const e2subs =  ['^    !                    ',
                   '      ^    !              ',
                   '            ^    !        ',
                   '                  ^    !  ',
                   '                        ^!'];
    const expected = '-----f-----f-----f-----f-|';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should mirror source if durations are always empty', () => {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                        !';
    const e2 =  cold('|');
    const expected = 'abcdefabcdefabcdefabcdefa|';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit no values if duration is a never', () => {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^                            !';
    const e2 =  cold('-');
    const e2subs =   '    ^                        !';
    const expected = '-----------------------------|';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe duration Observable when source raise error', () => {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa#');
    const e1subs =   '^                            !';
    const e2 =  cold('-');
    const e2subs =   '    ^                        !';
    const expected = '-----------------------------#';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error as soon as just-throw duration is used', () => {
    const e1 =   hot('----abcdefabcdefabcdefabcdefa|');
    const e1subs =   '^   !                         ';
    const e2 =  cold('#');
    const e2subs =   '    (^!)                      ';
    const expected = '----(-#)                      ';

    const result = e1.inspect(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should inspect using durations of constying lengths', () => {
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
    const expected = '-----f---d-------h--c-|   ';

    let i = 0;
    const result = e1.inspect(() => e2[i++]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should propagate error from duration Observable', () => {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^                !        ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------#        ')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                ',
                   '          ^      !        '];
    const expected = '-----f---d-------#        ';

    let i = 0;
    const result = e1.inspect(() => e2[i++]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    for (let j = 0; j < e2.length; j++) {
      expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
    }
  });

  it('should propagate error thrown from durationSelector function', () => {
    const e1 =   hot('abcdefabcdabcdefghabca|   ');
    const e1subs =   '^         !               ';
    const e2 = [cold('-----|                    '),
              cold(      '---|                '),
              cold(          '-------|        ')];
    const e2subs =  ['^    !                    ',
                   '      ^  !                '];
    const expected = '-----f---d#               ';

    let i = 0;
    const result = e1.inspect(() => {
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

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.inspect(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.inspect(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () => {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.inspect(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.inspect(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () => {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';
    function durationSelector() { return cold('-----|'); }

    expectObservable(e1.inspect(durationSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should inspect by promise resolves', (done: DoneSignature) => {
    const e1 = Observable.interval(10).take(5);
    const expected = [0, 1, 2, 3];

    e1.inspect(() => {
      return new Promise((resolve: any) => { resolve(42); });
    }).subscribe(
      (x: number) => {
        expect(x).toEqual(expected.shift()); },
      () => {
        done.fail('should not be called');
      },
      () => {
        expect(expected.length).toBe(0);
        done();
      }
    );
  });

  it('should raise error when promise rejects', (done: DoneSignature) => {
    const e1 = Observable.interval(10).take(10);
    const expected = [0, 1, 2];
    const error = new Error('error');

    e1.inspect((x: number) => {
      if (x === 3) {
        return new Promise((resolve: any, reject: any) => { reject(error); });
      } else {
        return new Promise((resolve: any) => { resolve(42); });
      }
    }).subscribe(
      (x: number) => {
        expect(x).toEqual(expected.shift()); },
      (err: any) => {
        expect(err).toBe(error);
        expect(expected.length).toBe(0);
        done();
      },
      () => {
        done.fail('should not be called');
      }
    );
  });
});
