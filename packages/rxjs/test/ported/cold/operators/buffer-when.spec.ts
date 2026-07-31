// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/bufferWhen-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { buffer } from 'rxjs/buffer';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
describe('bufferWhen (cold)', () => {
  it('should emit buffers that close and reopen', async () => {
    await rxTest(({ hot, cold, expectObservable }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---------|   ');
      const e2 = cold('    --------------(s|)                    ');
      //                                 --------------(s|)
      const expected = '   --------------x-------------y-----(z|)';
      const values = {
        x: ['b', 'c', 'd'],
        y: ['e', 'f', 'g'],
        z: [],
      };
      expectObservable(e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false })).toBe(expected, values);
    });
  });
  it('should emit buffers using varying cold closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const subs = '       ^----------------------------------!      ';
      const closings = [
        cold('             ---------------s--|                       '),
        cold('                            ----------(s|)             '),
        cold('                                      -------------(s|)'),
      ];
      const expected = '   ---------------x---------y---------(z|)   ';
      const values = {
        x: ['b', 'c', 'd'],
        y: ['e', 'f', 'g'],
        z: ['h'],
      };
      let i = 0;
      const result = e1[buffer]({ delay: () => closings[i++], emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit buffers using varying hot closings', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const subs = '       ^----------------------------------!   ';
      const closings = [
        {
          obs: hot('   -1--^--------------s---|                   '),
          sub: '           ^--------------!                       ',
        },
        {
          obs: hot('   --1-^----3--------4----------s-|           '),
          sub: '           ---------------^---------!             ',
        },
        {
          obs: hot('   1-2-^------3----4-------5--6-----------s--|'),
          sub: '           -------------------------^---------!   ',
        },
      ];
      const expected = '   ---------------x---------y---------(z|)';
      const values = {
        x: ['b', 'c', 'd'],
        y: ['e', 'f', 'g'],
        z: ['h'],
      };
      let i = 0;
      const result = e1[buffer]({ delay: () => closings[i++].obs, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      for (let j = 0; j < closings.length; j++) {
        expectSubscriptions(closings[j].obs.subscriptions).toBe(closings[j].sub);
      }
    });
  });
  it('should not emit buffers using varying empty delayed closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const subs = '       ^----------------------------------!   ';
      const closings = [
        cold('             ---------------|                       '),
        cold('                            ----------|             '),
        cold('                                      -------------|'),
      ];
      const closeSubs = [
        '                  ^--------------!                       ',
        '                                                         ',
        '                                                         ',
      ];
      const expected = '   -----------------------------------(x|)';
      const values = {
        x: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
      };
      let i = 0;
      const result = e1[buffer]({ delay: () => closings[i++], emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });
  it('should emit buffers using varying cold closings, outer unsubscribed early', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const unsub = '      ------------------!                       ';
      const subs = '       ^-----------------!                       ';
      const closings = [
        cold('             ---------------(s|)                       '),
        cold('                            ----------(s|)             '),
        cold('                                      -------------(s|)'),
      ];
      const closeSubs = [
        '                  ^--------------!                          ',
        '                  ---------------^--!                       ',
      ];
      const expected = '   ---------------x---                       ';
      const values = {
        x: ['b', 'c', 'd'],
      };
      let i = 0;
      const result = e1[buffer]({ delay: () => closings[i++], emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe([]);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const subs = '       ^-----------------!                       ';
      const closings = [
        cold('             ---------------(s|)                       '),
        cold('                            ----------(s|)             '),
        cold('                                      -------------(s|)'),
      ];
      const closeSubs = [
        '                  ^--------------!                          ',
        '                  ---------------^--!                       ',
      ];
      const expected = '   ---------------x---                       ';
      const unsub = '      ------------------!                       ';
      const values = {
        x: ['b', 'c', 'd'],
      };
      let i = 0;
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [buffer]({ delay: () => closings[i++], emitEmpty: true, emitRemainingOnError: false })
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe([]);
    });
  });
  it('should propagate error thrown from closingSelector', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const subs = '       ^--------------!                          ';
      const closings = [
        cold('             ---------------s--|                       '),
        cold('                            ----------(s|)             '),
        cold('                                      -------------(s|)'),
      ];
      const closeSubs0 = ' ^--------------!                          ';
      const expected = '   ---------------(x#)                       ';
      const values = { x: ['b', 'c', 'd'] };
      let i = 0;
      const result = e1[buffer]({
        delay: () => {
          if (i === 1) {
            throw 'error';
          }
          return closings[i++];
        },
        emitEmpty: true,
        emitRemainingOnError: false,
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs0);
    });
  });
  it('should propagate error emitted from a closing', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const subs = '       ^--------------!                    ';
      const closings = [
        cold('             ---------------s--|                 '),
        cold('                            #                    '),
      ];
      const closeSubs = [
        '                  ^--------------!                    ',
        '                  ---------------(^!)                 ',
      ];
      const expected = '   ---------------(x#)                 ';
      const values = {
        x: ['b', 'c', 'd'],
      };
      let i = 0;
      const result = e1[buffer]({ delay: () => closings[i++], emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should propagate error emitted late from a closing', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const subs = '       ^--------------------!              ';
      const closings = [
        cold('             ---------------s--|                 '),
        cold('                            ------#              '),
      ];
      const closeSubs = [
        '                  ^--------------!                    ',
        '                  ---------------^-----!              ',
      ];
      const expected = '   ---------------x-----#              ';
      const values = { x: ['b', 'c', 'd'] };
      let i = 0;
      const result = e1[buffer]({ delay: () => closings[i++], emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---#');
      const e2 = cold('    ---------------(s|)      ');
      //                                ---------------(s|)
      // prettier-ignore
      const e2subs = [
                '                  ^--------------!         ',
                '                  ---------------^--------!',
            ];
      const expected = '   ---------------x--------#';
      const values = {
        x: ['b', 'c', 'd'],
      };
      const result = e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e2 = cold(' --------(s|)');
      const e1subs = '  (^!)';
      const expected = '(x|)';
      const values = {
        x: [],
      };
      const result = e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e2 = cold(' --------(s|)');
      const e1subs = '  (^!)';
      const expected = '#';
      const values = {
        x: [],
      };
      const result = e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const unsub = '   --------------------------------------------!';
      const e1subs = '  ^-------------------------------------------!';
      const e2 = cold(' --------(s|)                                 ');
      const e2subs = [
        '               ^-------!                                    ',
        '               --------^-------!                            ',
        '               ----------------^-------!                    ',
        '               ------------------------^-------!            ',
        '               --------------------------------^-------!    ',
        '               ----------------------------------------^---!',
      ];
      const expected = '--------x-------x-------x-------x-------x----';
      const values = {
        x: [],
      };
      const source = e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle an inner never', async () => {
    await rxTest(({ hot, cold, expectObservable }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e2 = cold('-');
      const expected = '   -----------------------------------(x|)';
      const values = {
        x: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
      };
      expectObservable(e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false })).toBe(expected, values);
    });
  });
  it('should handle inner throw', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     (^!)';
      const e2 = cold('    #');
      const e2subs = '     (^!)';
      const expected = '   #';
      const values = {
        x: ['b', 'c', 'd', 'e', 'f', 'g', 'h'],
      };
      const result = e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle disposing of source', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const subs = '       ^-------------------!';
      const unsub = '      --------------------!';
      const e2 = cold('    ---------------(s|)');
      //                                  ---------------(s|)
      const expected = '   ---------------x-----';
      const values = {
        x: ['b', 'c', 'd'],
        y: ['e', 'f', 'g', 'h'],
        z: [],
      };
      const source = e1[buffer]({ delay: () => e2, emitEmpty: true, emitRemainingOnError: false });
      expectObservable(source, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
});
