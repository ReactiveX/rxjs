import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {windowWhen} */
describe('Observable.prototype.windowWhen', () => {
  asDiagram('windowWhen')('should emit windows that close and reopen', () => {
    const e1 = hot('--a--^--b--c--d--e--f--g--h--i--|');
    const e1subs =      '^                          !';
    const e2 = cold(    '-----------|                ');
    const e2subs =     ['^          !                ',
                      '           ^          !     ',
                      '                      ^    !'];
    const a = cold(     '---b--c--d-|                ');
    const b = cold(                '-e--f--g--h|     ');
    const c = cold(                           '--i--|');
    const expected =    'a----------b----------c----|';
    const values = { a: a, b: b, c: c };

    const source = e1.windowWhen(() => e2);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit windows using constying cold closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    const e1subs =      '^                                  !     ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----(s|)               '),
      cold(                                 '---------------(s|)')];
    const closeSubs =  ['^                !                       ',
                      '                 ^    !                  ',
                      '                      ^            !     '];
    const expected =    'x----------------y----z------------|     ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '---f-|                  ');
    const z = cold(                           '--g---h------|     ');
    const values = { x: x, y: y, z: z };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++]);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
  });

  it('should emit windows using constying hot closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    const subs =        '^                                  !   ';
    const closings = [
      {obs: hot(  '-1--^----------------s-|                   '), // eslint-disable-line key-spacing
       sub:           '^                !                     '}, // eslint-disable-line key-spacing
      {obs: hot(      '-----3----4-----------(s|)             '), // eslint-disable-line key-spacing
       sub:           '                 ^    !                '}, // eslint-disable-line key-spacing
      {obs: hot(      '-------3----4-------5----------------s|'), // eslint-disable-line key-spacing
       sub:           '                      ^            !   '}]; // eslint-disable-line key-spacing
    const expected =    'x----------------y----z------------|   ';
    const x = cold(     '----b---c---d---e|                     ');
    const y = cold(                      '---f-|                ');
    const z = cold(                           '--g---h------|   ');
    const values = { x: x, y: y, z: z };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++].obs);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].obs.subscriptions).toBe(closings[0].sub);
    expectSubscriptions(closings[1].obs.subscriptions).toBe(closings[1].sub);
    expectSubscriptions(closings[2].obs.subscriptions).toBe(closings[2].sub);
  });

  it('should emit windows using constying empty delayed closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|  ');
    const e1subs =      '^                                  !  ';
    const closings = [
      cold(           '-----------------|                    '),
      cold(                            '-----|               '),
      cold(                                 '---------------|')];
    const closeSubs =  ['^                !                    ',
                      '                 ^    !               ',
                      '                      ^            !  '];
    const expected =    'x----------------y----z------------|  ';
    const x = cold(     '----b---c---d---e|                    ');
    const y = cold(                      '---f-|               ');
    const z = cold(                           '--g---h------|  ');
    const values = { x: x, y: y, z: z };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++]);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
  });

  it('should emit windows using constying cold closings, outer unsubscribed early', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    const e1subs =      '^                    !                   ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '---------(s|)           ')];
    const closeSubs =  ['^                !                       ',
                      '                 ^   !                   '];
    const expected =    'x----------------y----                   ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '---f-                   ');
    const unsub =       '                     !                   ';
    const values = { x: x, y: y };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++]);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    const e1subs =      '^                    !                   ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '---------(s|)           ')];
    const closeSubs =  ['^                !                       ',
                      '                 ^   !                   '];
    const expected =    'x----------------y----                   ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '---f-                   ');
    const unsub =       '                     !                   ';
    const values = { x: x, y: y };

    let i = 0;
    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .windowWhen(() => closings[i++])
      .mergeMap((x: Rx.Observable<string>) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate error thrown from closingSelector', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    const e1subs =      '^                !                       ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----(s|)               '),
      cold(                                 '---------------(s|)')];
    const closeSubs =  ['^                !                       '];
    const expected =    'x----------------(y#)                    ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '#                       ');
    const values = { x: x, y: y };

    let i = 0;
    const result = e1.windowWhen(() => {
      if (i === 1) {
        throw 'error';
      }
      return closings[i++];
    });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
  });

  it('should propagate error emitted from a closing', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    const e1subs =      '^                !                       ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '#                       ')];
    const closeSubs =  ['^                !                       ',
                      '                 (^!)                    '];
    const expected =    'x----------------(y#)                    ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '#                       ');
    const values = { x: x, y: y };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++]);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate error emitted late from a closing', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|     ');
    const e1subs =      '^                     !                  ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-----#                  ')];
    const closeSubs =  ['^                !                       ',
                      '                 ^    !                  '];
    const expected =    'x----------------y----#                  ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '---f-#                  ');
    const values = { x: x, y: y };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++]);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate errors emitted from the source', () => {
    const e1 = hot('--a--^---b---c---d---e---f-#                  ');
    const e1subs =      '^                     !                  ';
    const closings = [
      cold(           '-----------------s--|                    '),
      cold(                            '-------(s|)             ')];
    const closeSubs =  ['^                !                       ',
                      '                 ^    !                  '];
    const expected =    'x----------------y----#                  ';
    const x = cold(     '----b---c---d---e|                       ');
    const y = cold(                      '---f-#                  ');
    const values = { x: x, y: y };

    let i = 0;
    const result = e1.windowWhen(() => closings[i++]);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should handle empty source', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const e2 = cold( '-----c--|');
    const e2subs =   '(^!)';
    const expected = '(w|)';
    const values = { w: cold('|') };

    const result = e1.windowWhen(() => e2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a never source', () => {
    const e1 = cold( '-');
    const unsub =    '                 !';
    const e1subs =   '^                !';
    const e2 = cold( '-----c--|');
    //                   -----c--|
    //                        -----c--|
    //                             -----c--|
    const e2subs =  ['^    !            ',
                   '     ^    !       ',
                   '          ^    !  ',
                   '               ^ !'];
    const win = cold('-----|');
    const d =   cold(               '---');
    const expected = 'a----b----c----d--';
    const values = { a: win, b: win, c: win, d: d };

    const result = e1.windowWhen(() => e2);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw', () => {
    const e1 = cold('#');
    const e1subs =  '(^!)';
    const e2 = cold('-----c--|');
    const e2subs =  '(^!)';
    const win = cold('#');
    const expected = '(w#)';
    const values = { w: win };

    const result = e1.windowWhen(() => e2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a never closing Observable', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e1subs =      '^                                  !';
    const e2 =  cold(   '-');
    const e2subs =      '^                                  !';
    const expected =    'x----------------------------------|';
    const x = cold(     '----b---c---d---e---f---g---h------|');
    const values = { x: x };

    const result = e1.windowWhen(() => e2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle a throw closing Observable', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e1subs =      '(^!)                                ';
    const e2 =  cold(   '#');
    const e2subs =      '(^!)                                ';
    const expected =    '(x#)                                ';
    const x = cold(     '#                                   ');
    const values = { x: x };

    const result = e1.windowWhen(() => e2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});
