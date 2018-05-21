import { expect } from 'chai';
import { of, EMPTY } from 'rxjs';
import { bufferWhen, mergeMap, takeWhile } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {bufferWhen} */
describe('bufferWhen operator', () => {
  asDiagram('bufferWhen')('should emit buffers that close and reopen', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---------|');
    const e2 = cold(    '--------------(s|)');
    //                               --------------(s|)
    const expected =    '--------------x-------------y-----(z|)';
    const values = {
      x: ['b', 'c', 'd'],
      y: ['e', 'f', 'g'],
      z: [] as string[]
    };

    expectObservable(e1.pipe(bufferWhen(() => e2))).toBe(expected, values);
  });

  it('should emit buffers using constying cold closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const subs =        '^                                  !      ';
    const closings = [
      cold(           '---------------s--|                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    const expected =    '---------------x---------y---------(z|)   ';
    const values = {
      x: ['b', 'c', 'd'],
      y: ['e', 'f', 'g'],
      z: ['h']
    };

    let i = 0;
    const result = e1.pipe(bufferWhen(() => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers using constying hot closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
    const subs =        '^                                  !   ';
    const closings = [
      {obs: hot(  '-1--^--------------s---|                   '), // eslint-disable-line key-spacing
       sub:           '^              !                       '}, // eslint-disable-line key-spacing
      {obs: hot(  '--1-^----3--------4----------s-|           '), // eslint-disable-line key-spacing
       sub:           '               ^         !             '}, // eslint-disable-line key-spacing
      {obs: hot(  '1-2-^------3----4-------5--6-----------s--|'), // eslint-disable-line key-spacing
       sub:           '                         ^         !   '}]; // eslint-disable-line key-spacing
    const expected =    '---------------x---------y---------(z|)';
    const values = {
      x: ['b', 'c', 'd'],
      y: ['e', 'f', 'g'],
      z: ['h']
    };

    let i = 0;
    const result = e1.pipe(bufferWhen(() => closings[i++].obs));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    for (let j = 0; j < closings.length; j++) {
      expectSubscriptions(closings[j].obs.subscriptions).toBe(closings[j].sub);
    }
  });

  it('should emit buffers using constying empty delayed closings', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|    ');
    const subs =        '^                                  !   ';
    const closings = [
      cold(           '---------------|                       '),
      cold(                          '----------|             '),
      cold(                                    '-------------|')];
    const closeSubs =  ['^              !                       ',
                      '               ^         !             ',
                      '                         ^         !   '];
    const expected =    '---------------x---------y---------(z|)';
    const values = {
      x: ['b', 'c', 'd'],
      y: ['e', 'f', 'g'],
      z: ['h']
    };

    let i = 0;
    const result = e1.pipe(bufferWhen(() => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
  });

  it('should emit buffers using constying cold closings, outer unsubscribed early', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const unsub =       '                  !                       ';
    const subs =        '^                 !                       ';
    const closings = [
      cold(           '---------------(s|)                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    const closeSubs =  ['^              !                          ',
                      '               ^  !                       '];
    const expected =    '---------------x---                       ';
    const values = {
      x: ['b', 'c', 'd']
    };

    let i = 0;
    const result = e1.pipe(bufferWhen(() => closings[i++]));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe([]);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const subs =        '^                 !                       ';
    const closings = [
      cold(           '---------------(s|)                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    const closeSubs =  ['^              !                          ',
                      '               ^  !                       '];
    const expected =    '---------------x---                       ';
    const unsub =       '                  !                       ';
    const values = {
      x: ['b', 'c', 'd']
    };

    let i = 0;
    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      bufferWhen(() => closings[i++]),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    expectSubscriptions(closings[2].subscriptions).toBe([]);
  });

  it('should propagate error thrown from closingSelector', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
    const subs =        '^              !                          ';
    const closings = [
      cold(           '---------------s--|                       '),
      cold(                          '----------(s|)             '),
      cold(                                    '-------------(s|)')];
    const closeSubs0 =  '^              !                          ';
    const expected =    '---------------(x#)                       ';
    const values = { x: ['b', 'c', 'd'] };

    let i = 0;
    const result = e1.pipe(
      bufferWhen(() => {
        if (i === 1) {
          throw 'error';
        }
        return closings[i++];
      })
    );

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs0);
  });

  it('should propagate error emitted from a closing', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const subs =        '^              !                    ';
    const closings = [
      cold(           '---------------s--|                 '),
      cold(                          '#                    ')];
    const closeSubs =  ['^              !                    ',
                      '               (^!)                 '];
    const expected =    '---------------(x#)                 ';
    const values = { x: ['b', 'c', 'd'] };

    let i = 0;
    const result = e1.pipe(bufferWhen(() => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should propagate error emitted late from a closing', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const subs =        '^                    !              ';
    const closings = [
      cold(           '---------------s--|                 '),
      cold(                          '------#              ')];
    const closeSubs =  ['^              !                    ',
                      '               ^     !              '];
    const expected =    '---------------x-----#              ';
    const values = { x: ['b', 'c', 'd'] };

    let i = 0;
    const result = e1.pipe(bufferWhen(() => closings[i++]));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
    expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
  });

  it('should handle errors', () => {
    const e1 = hot('--a--^---b---c---d---e---f---#');
    const e2 = cold(    '---------------(s|)');
    //                                ---------------(s|)
    const e2subs =     ['^              !         ',
                      '               ^        !'];
    const expected =    '---------------x--------#';
    const values = {
      x: ['b', 'c', 'd']
    };

    const result = e1.pipe(bufferWhen(() => e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle empty', () => {
    const e1 =  cold('|');
    const e2 =  cold('--------(s|)');
    const e1subs =   '(^!)';
    const expected = '(x|)';
    const values = {
      x: [] as string[]
    };

    const result = e1.pipe(bufferWhen(() => e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle throw', () => {
    const e1 =  cold('#');
    const e2 =  cold('--------(s|)');
    const e1subs =   '(^!)';
    const expected = '#';
    const values = {
      x: [] as string[]
    };

    const result = e1.pipe(bufferWhen(() => e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 =   hot('-');
    const unsub =    '                                            !';
    const e1subs =   '^                                           !';
    const e2 = cold( '--------(s|)                                 ');
    const e2subs =  ['^       !                                    ',
                   '        ^       !                            ',
                   '                ^       !                    ',
                   '                        ^       !            ',
                   '                                ^       !    ',
                   '                                        ^   !'];
    const expected = '--------x-------x-------x-------x-------x----';
    const values = {
      x: [] as string[]
    };

    const source = e1.pipe(bufferWhen(() => e2));

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle an inner never', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e2 = cold('-');
    const expected =    '-----------------------------------(x|)';
    const values = {
      x: ['b', 'c', 'd', 'e', 'f', 'g', 'h']
    };

    expectObservable(e1.pipe(bufferWhen(() => e2))).toBe(expected, values);
  });

  // bufferWhen is not supposed to handle a factory that returns always empty
  // closing Observables, because doing such would constantly recreate a new
  // buffer in a synchronous infinite loop until the stack overflows. This also
  // happens with buffer in RxJS 4.
  it('should NOT handle hot inner empty', (done: MochaDone) => {
    const source = of(1, 2, 3, 4, 5, 6, 7, 8, 9);
    const closing = EMPTY;
    const TOO_MANY_INVOCATIONS = 30;

    source.pipe(
      bufferWhen(() => closing),
      takeWhile((val: any, index: number) => index < TOO_MANY_INVOCATIONS)
    ).subscribe((val: any) => {
      expect(Array.isArray(val)).to.be.true;
      expect(val.length).to.equal(0);
    }, (err: any) => {
      done(new Error('should not be called'));
    }, () => {
      done();
    });
  });

  it('should handle inner throw', () => {
    const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
    const e1subs =      '(^!)';
    const e2 = cold(    '#');
    const e2subs =      '(^!)';
    const expected =    '#';
    const values = {
      x: ['b', 'c', 'd', 'e', 'f', 'g', 'h']
    };

    const result = e1.pipe(bufferWhen(() => e2));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle disposing of source', () => {
    const e1 =         hot('--a--^---b---c---d---e---f---g---h------|');
    const subs =                '^                   !';
    const unsub =               '                    !';
    const e2 = cold(            '---------------(s|)');
    //                                        ---------------(s|)
    const expected =            '---------------x-----';
    const values = {
      x: ['b', 'c', 'd'],
      y: ['e', 'f', 'g', 'h'],
      z: [] as string[]
    };

    const source = e1.pipe(bufferWhen(() => e2));

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});
