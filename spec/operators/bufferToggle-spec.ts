import { expect } from 'chai';
import { of, concat, timer, EMPTY } from 'rxjs';
import { bufferToggle, mergeMap, mapTo } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {bufferToggle} */
describe('bufferToggle operator', () => {
  asDiagram('bufferToggle')('should emit buffers using hot openings and hot closings', () => {
    const e1 =   hot('---a---b---c---d---e---f---g---|');
    const e2 =   hot('--o------------------o---------|');
    const e3 =   hot('---------c---------------c-----|');
    const expected = '---------x---------------y-----|';
    const values = {
      x: ['a', 'b'],
      y: ['f'],
    };

    const result = e1.pipe(bufferToggle(e2, (x: any) => e3));

    expectObservable(result).toBe(expected, values);
  });

  it('should emit buffers that are opened by an observable from the first argument ' +
      'and closed by an observable returned by the function in the second argument',
  () => {
    const e1 =   hot('-----a----b----c----d----e----f----g----h----i----|');
    const e2 =  cold('-------------x-------------y--------------z-------|');
    const e3 =               cold('---------------(j|)');
    //                                         ---------------(j|)
    //                                                        ---------------(j|)
    const expected = '----------------------------q-------------r-------(s|)';

    const values = {
      q: ['c', 'd', 'e'],
      r: ['f', 'g', 'h'],
      s: ['i']
    };
    const innerVals = ['x', 'y', 'z'];

    expectObservable(e1.pipe(
      bufferToggle(e2, (x: string) => {
        expect(x).to.equal(innerVals.shift());
        return e3;
      }))
    ).toBe(expected, values);
  });

  it('should emit buffers using constying cold closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const e2 =     cold('--x-----------y--------z---|              ');
    const subs =        '^                                  !      ';
    const closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    const closeSubs =  ['  ^              !                        ',
                      '              ^   !                       ',
                      '                       ^           !      '];
    const expected =    '-----------------ij----------------(k|)   ';
    const values = {
      i: ['b', 'c', 'd', 'e'],
      j: ['e'],
      k: ['g', 'h']
    };

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
  });

  it('should emit buffers using constying hot closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    const e2 =     cold('--x-----------y--------z---|           ');
    const subs =        '^                                  !   ';
    const closings = [
      {obs: hot(  '-1--^----------------s-|                   '), // eslint-disable-line key-spacing
       sub:           '  ^              !                     '}, // eslint-disable-line key-spacing
      {obs: hot(      '-----3----4-------(s|)                 '), // eslint-disable-line key-spacing
       sub:           '              ^   !                    '}, // eslint-disable-line key-spacing
      {obs: hot(      '-------3----4-------5----------------s|'), // eslint-disable-line key-spacing
       sub:           '                       ^           !   '}]; // eslint-disable-line key-spacing
    const expected =    '-----------------ij----------------(k|)';
    const values = {
      i: ['b', 'c', 'd', 'e'],
      j: ['e'],
      k: ['g', 'h']
    };

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++].obs));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    for (let j = 0; j < closings.length; j++) {
      expectSubscriptions(closings[j].obs.subscriptions).toBe(closings[j].sub);
    }
  });

  it('should emit buffers using constying empty delayed closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    const e2 =     cold('--x-----------y--------z---|           ');
    const subs =        '^                                  !   ';
    const closings = [
      cold(             '---------------|                     '),
      cold(                         '----|                    '),
      cold(                                  '---------------|')];
    const expected =    '-----------------ij----------------(k|)';
    const values = {
      i: ['b', 'c', 'd', 'e'],
      j: ['e'],
      k: ['g', 'h']
    };

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers using constying cold closings, outer unsubscribed early', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const subs =        '^         !                               ';
    const e2 =     cold('--x-----------y--------z---|              ');
    const closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    const csub0 =       '  ^       !                               ';
    const expected =    '-----------                               ';
    const unsub =       '          !                               ';
    const values = {
      i: ['b', 'c', 'd', 'e']
    };

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++]));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(csub0);
    expectSubscriptions(closings[1].subscriptions).toBe([]);
    expectSubscriptions(closings[2].subscriptions).toBe([]);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const subs =        '^                 !                       ';
    const e2 =     cold('--x-----------y--------z---|              ');
    const closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    const expected =    '-----------------i-                       ';
    const unsub =       '                  !                       ';
    const values = {
      i: ['b', 'c', 'd', 'e']
    };

    let i = 0;
    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      bufferToggle(e2, () => closings[i++]),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should propagate error thrown from closingSelector', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const e2 =     cold('--x-----------y--------z---|              ');
    const subs =        '^             !                           ';
    const closings = [
      cold(             '---------------s--|                     '),
      cold(                         '----(s|)                    '),
      cold(                                  '---------------(s|)')];
    const closeSubs0 =  '  ^           !                           ';
    const expected =    '--------------#                           ';

    let i = 0;
    const result = e1.pipe(
      bufferToggle(e2, () => {
        if (i === 1) {
          throw 'error';
        }
        return closings[i++];
      })
    );

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs0);
    expectSubscriptions(closings[1].subscriptions).toBe([]);
    expectSubscriptions(closings[2].subscriptions).toBe([]);
  });

  it('should propagate error emitted from a closing', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e2 =     cold('--x-----------y--------z---|        ');
    const subs =        '^             !                     ';
    const closings = [
      cold(             '---------------s--|               '),
      cold(                         '#                     ')];
    const closeSubs =  ['  ^           !                     ',
                      '              (^!)                  '];
    const expected =    '--------------#                     ';

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate error emitted late from a closing', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e2 =     cold('--x-----------y--------z---|        ');
    const subs =        '^                  !                ';
    const closings = [
      cold(             '---------------s--|               '),
      cold(                         '-----#                ')];
    const closeSubs =  ['  ^              !                  ',
                      '              ^    !                '];
    const expected =    '-----------------i-#                ';
    const values = {
      i: ['b', 'c', 'd', 'e']
    };

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should handle errors', () => {
    const e1 = hot('--a--^---b---c---d---e--#        ');
    const e2 =     cold('--x-----------y--------z---|');
    const subs =        '^                  !        ';
    const closings = [
      cold(             '---------------s--|       '),
      cold(                         '-------s|     ')];
    const closeSubs =  ['  ^              !                  ',
                      '              ^    !                '];
    const expected =    '-----------------i-#        ';
    const values = {
      i: ['b', 'c', 'd', 'e']
    };

    let i = 0;
    const result = e1.pipe(bufferToggle(e2, () => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should handle empty source', () => {
    const e1 =  cold('|');
    const e2 =  cold('--o-----|');
    const e3 =  cold(  '-----c--|');
    const expected = '|';
    const values = { x: [] as string[] };

    const result = e1.pipe(bufferToggle(e2, () => e3));

    expectObservable(result).toBe(expected, values);
  });

  it('should handle throw', () => {
    const e1 =  cold('#');
    const e2 =  cold('--o-----|');
    const e3 =  cold(  '-----c--|');
    const expected = '#';
    const values = { x: [] as string[] };

    const result = e1.pipe(bufferToggle(e2, () => e3));

    expectObservable(result).toBe(expected, values);
  });

  it('should handle never', () => {
    const e1 =   hot('-');
    const e2 =  cold('--o-----o------o-----o---o-----|');
    const e3 =  cold(  '--c-|');
    const unsub =    '                                            !';
    const subs =     '^                                           !';
    const expected = '----x-----x------x-----x---x-----------------';
    const values = { x: [] as string[] };

    const result = e1.pipe(bufferToggle(e2, () => e3));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never opening Observable', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e2 = cold(    '-');
    const e3 =  cold(   '--c-|');
    const expected =    '-----------------------------------|';

    const result = e1.pipe(bufferToggle(e2, () => e3));

    expectObservable(result).toBe(expected);
  });

  it('should handle a never closing Observable', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e2 = cold(    '---o---------------o-----------|');
    const e3 =  cold('-');
    const expected =    '-----------------------------------(xy|)';
    const values = {
      x: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
      y: ['f', 'g', 'h']
    };

    const result = e1.pipe(bufferToggle(e2, () => e3));

    expectObservable(result).toBe(expected, values);
  });

  it('should handle opening Observable that just throws', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e1subs =      '(^!)';
    const e2 = cold(    '#');
    const e2subs =      '(^!)';
    const e3 = cold(    '--c-|');
    const expected =    '#';

    const result = e1.pipe(bufferToggle(e2, () => e3));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should accept openings resolved promise', (done: MochaDone) => {
    const e1 = concat(
      timer(10).pipe(mapTo(1)),
      timer(100).pipe(mapTo(2)),
      timer(150).pipe(mapTo(3)),
      timer(200).pipe(mapTo(4))
    );

    const expected = [[1]];

    e1.pipe(
      bufferToggle(new Promise((resolve: any) => { resolve(42); }), () => {
        return timer(50);
      })
    ).subscribe((x) => {
      expect(x).to.deep.equal(expected.shift());
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      expect(expected.length).to.be.equal(0);
      done();
    });
  });

  it('should accept openings rejected promise', (done: MochaDone) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(100).pipe(mapTo(4))
    );

    const expected = 42;

    e1.pipe(
      bufferToggle(new Promise((resolve: any, reject: any) => { reject(expected); }), () => {
        return timer(50);
      })
    ).subscribe((x) => {
      done(new Error('should not be called'));
    }, (x) => {
      expect(x).to.equal(expected);
      done();
    }, () => {
      done(new Error('should not be called'));
    });
  });

  it('should accept closing selector that returns a resolved promise', (done: MochaDone) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(100).pipe(mapTo(4))
    );
    const expected = [[1]];

    e1.pipe(bufferToggle(of(10), () => new Promise((resolve: any) => { resolve(42); })))
      .subscribe((x) => {
        expect(x).to.deep.equal(expected.shift());
      }, () => {
        done(new Error('should not be called'));
      }, () => {
        expect(expected.length).to.be.equal(0);
        done();
      });
  });

  it('should accept closing selector that returns a rejected promise', (done: MochaDone) => {
    const e1 = concat(of(1),
      timer(10).pipe(mapTo(2)),
      timer(10).pipe(mapTo(3)),
      timer(100).pipe(mapTo(4))
      );

    const expected = 42;

    e1.pipe(bufferToggle(of(10), () => new Promise((resolve: any, reject: any) => { reject(expected); })))
      .subscribe((x) => {
        done(new Error('should not be called'));
      }, (x) => {
        expect(x).to.equal(expected);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should handle empty closing observable', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const subs =        '^                                  !';
    const e2 =     cold('--x-----------y--------z---|        ');
    const expected =    '--l-----------m--------n-----------|';

    const result = e1.pipe(bufferToggle(e2, () => EMPTY));

    expectObservable(result).toBe(expected, {l: [], m: [], n: []});
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});
