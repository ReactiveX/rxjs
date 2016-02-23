import * as Rx from '../../dist/cjs/Rx.KitchenSink';
declare const {hot, cold, time, expectObservable};

declare const rxTestScheduler: Rx.TestScheduler;

/** @test {cache} */
describe('Observable.prototype.cache', () => {
  it('should replay values upon subscription', () => {
    const s1 = hot('---^---a---b---c---|     ').cache();
    const expected1 = '----a---b---c---|     ';
    const expected2 = '                (abc|)';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should replay values and error', () => {
    const s1 = hot('---^---a---b---c---#     ').cache();
    const expected1 = '----a---b---c---#     ';
    const expected2 = '                (abc#)';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should replay values and and share', () => {
    const s1 = hot('---^---a---b---c------------d--e--f-|').cache();
    const expected1 = '----a---b---c------------d--e--f-|';
    const expected2 = '                (abc)----d--e--f-|';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should have a bufferCount that limits the replay test 1', () => {
    const s1 = hot('---^---a---b---c------------d--e--f-|').cache(1);
    const expected1 = '----a---b---c------------d--e--f-|';
    const expected2 = '                c--------d--e--f-|';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should have a bufferCount that limits the replay test 2', () => {
    const s1 = hot('---^---a---b---c------------d--e--f-|').cache(2);
    const expected1 = '----a---b---c------------d--e--f-|';
    const expected2 = '                (bc)-----d--e--f-|';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should accept a windowTime that limits the replay', () => {
    const w = time(         '----------|');
    const s1 = hot('---^---a---b---c------------d--e--f-|').cache(Number.POSITIVE_INFINITY, w, rxTestScheduler);
    const expected1 = '----a---b---c------------d--e--f-|';
    const expected2 = '                (bc)-----d--e--f-|';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should handle empty', () => {
    const s1 =   cold('|').cache();
    const expected1 = '|';
    const expected2 = '                |';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should handle throw', () => {
    const s1 =   cold('#').cache();
    const expected1 = '#';
    const expected2 = '                #';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should handle never', () => {
    const s1 =   cold('-').cache();
    const expected1 = '-';
    const expected2 = '                -';
    const t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should multicast a completion', () => {
    const s1 = hot('--a--^--b------c-----d------e-|').cache();
    const t1 = time(    '|                         ');
    const e1 =          '---b------c-----d------e-|';
    const t2 = time(    '----------|               ');
    const e2 =          '          (bc)--d------e-|';
    const t3 = time(    '----------------|         ');
    const e3 =          '                (bcd)--e-|';

    const expected = [e1, e2, e3];

    [t1, t2, t3].forEach((t: any, i: number) => {
      rxTestScheduler.schedule(() => {
        expectObservable(s1).toBe(expected[i]);
      }, t);
    });
  });

  it('should multicast an error', () => {
    const s1 = hot('--a--^--b------c-----d------e-#').cache();
    const t1 = time(    '|                         ');
    const e1 =          '---b------c-----d------e-#';
    const t2 = time(    '----------|               ');
    const e2 =          '          (bc)--d------e-#';
    const t3 = time(    '----------------|         ');
    const e3 =          '                (bcd)--e-#';

    const expected = [e1, e2, e3];

    [t1, t2, t3].forEach((t: any, i: number) => {
      rxTestScheduler.schedule(() => {
        expectObservable(s1).toBe(expected[i]);
      }, t);
    });
  });

  it('should limit replay by both count and a window time, test 2', () => {
    const w = time(     '-----------|');
    const s1 = hot('--a--^---b---c----d----e------f--g--h--i-------|').cache(4, w, rxTestScheduler);
    const e1 =          '----b---c----d----e------f--g--h--i-------|';
    const t1 = time(    '--------------------|');
    //                          -----------|
    const e2 =          '                    (de)-f--g--h--i-------|'; // time wins
    const t2 = time(    '-----------------------------------|');
    const e3 =          '                                   (fghi)-|'; // count wins
    //                                         -----------|

    expectObservable(s1).toBe(e1);
    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(e2);
    }, t1);

    rxTestScheduler.schedule(() => {
      expectObservable(s1).toBe(e3);
    }, t2);
  });
});