import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, time, asDiagram, expectObservable, expectSubscriptions};

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

interface TimeInterval {
  value: any;
  interval: number;
}

function ti(v: any, i: number = 0): TimeInterval {
  return { value: v, interval: i };
};

function duration(x: TimeInterval): Rx.Observable<number> {
  return Observable.timer(x.interval, undefined, rxTestScheduler);
};

function concat(x: TimeInterval, y: TimeInterval): any {
  return x.value + y.value;
};

describe('Observable.prototype.join()', () => {
  it('should work for synced sources and duration', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('--a--b--c--|', xs);
    const xsubs =        '^          !';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^          !';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =     '--g--h--i--|';
    const values = { g: 'first0second0', h: 'first1second1', i: 'first2second2' };

    const r = x.join(y, duration, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should work if left emits a single value with full duration', () => {
    const xs = { a: ti('first0') };
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('--a--------|', xs);
    const xsubs =        '^          !';
    xs.a.interval = time('-----------|');

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^          !';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =     '--g--h--i--|';
    const values = { g: 'first0second0', h: 'first0second1', i: 'first0second2' };

    const r = x.join(y, duration, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should work if right emits a single value with full duration', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };
    const ys = { d: ti('second0') };

    let x =          hot('--a--b--c--|', xs);
    const xsubs =        '^          !';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('--d--------|', ys);
    const ysubs =        '^          !';
    ys.d.interval = time('-----------|');

    const expected =     '--g--h--i--|';
    const values = { g: 'first0second0', h: 'first1second0', i: 'first2second0' };

    const r = x.join(y, duration, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should work when sources and duration are not synced', () => {
    const xs = { a: ti(0), b: ti(1), c: ti(2), d: ti(3) };
    const ys = { g: ti('hat'), h: ti('bat'), i: ti('wag'), j: ti('pig') };

    let x =          hot('-a----b----------c-----d-|', xs);
    const xsubs =        '^                        !';
    xs.a.interval = time( '---|                     ');
    xs.b.interval = time(      '---|                ');
    xs.c.interval = time(                 '----|    ');
    xs.d.interval = time(                       '-| ');

    let y =          hot('--gh------i-j------------|', ys);
    const ysubs =        '^                        !';
    ys.g.interval = time(  '|                       ');
    ys.h.interval = time(   '|                      ');
    ys.i.interval = time(          '---------|      ');
    ys.j.interval = time(            '---------|    ');

    const expected =     '--tu-------------(wz)----|';
    const values = { t: '0hat', u: '0bat', w: '2wag', z: '2pig' };

    const r = x.join(y, duration, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should propagate errors from left', () => {
    const xs = { a: ti(0) };
    const ys = { g: ti('hat'), h: ti('bat') };

    let x =          hot('-a----#', xs);
    const xsubs =        '^     !';
    xs.a.interval = time( '---|  ');

    let y =          hot('--gh------i-j------------|', ys);
    const ysubs =        '^     !';
    ys.g.interval = time(  '|                       ');
    ys.h.interval = time(   '|                      ');

    const expected =     '--tu--#';
    const values = { t: '0hat', u: '0bat' };

    const r = x.join(y, duration, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should propagate errors from right', () => {
    const xs = { a: ti(0), b: ti(1), c: ti(2), d: ti(3) };
    const ys = { g: ti('hat'), h: ti('bat') };

    let x =          hot('-a----b----------c-----d-|', xs);
    const xsubs =        '^         !';
    xs.a.interval = time( '---|                     ');
    xs.b.interval = time(      '---|                ');
    xs.c.interval = time(                 '----|    ');
    xs.d.interval = time(                       '-| ');

    let y =          hot('--gh------#', ys);
    const ysubs =        '^         !';
    ys.g.interval = time(  '|        ');
    ys.h.interval = time(   '|       ');

    const expected =     '--tu------#';
    const values = { t: '0hat', u: '0bat' };

    const r = x.join(y, duration, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should propagate errors from left duration selector', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('--a--b--c--|', xs);
    const xsubs =        '^    !       ';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^    !      ';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =     '--g--#';
    const values = { g: 'first0second0' };

    const throwError = (v: TimeInterval) => {
      if (v.value === 'first1') {
        throw 'error';
      } else {
        return duration(v);
      }
    };

    const r = x.join(y, throwError, duration, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should propagate errors from right duration selector', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('--a--b--c--|', xs);
    const xsubs =        '^    !       ';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^    !      ';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =     '--g--#';
    const values = { g: 'first0second0' };

    const throwError = (v: TimeInterval) => {
      if (v.value === 'second1') {
        throw 'error';
      } else {
        return duration(v);
      }
    };

    const r = x.join(y, duration, throwError, concat);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should propagate errors from result selector', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('--a--b--c--|', xs);
    const xsubs =        '^       !   ';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^       !   ';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =     '--g--h--#';
    const values = { g: 'first0second0', h: 'first1second1' };

    const throwError = (vx: TimeInterval, vy: TimeInterval) => {
      if (vx.value === 'first2') {
        throw 'error';
      } else {
        return concat(vx, vy);
      }
    };

    const r = x.join(y, duration, duration, throwError);
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should work when left is never', () => {
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('------------');
    const xsubs =        '^          !';

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^          !';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =     '-----------|';

    let calls = 0;
    const durationCounted = (v: TimeInterval) => {
      calls++;
      return duration(v);
    };

    const r = x.join(y, duration, durationCounted, concat)
      .do(undefined, undefined, () => expect(calls).to.equal(3));
    expectObservable(r).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should work when right is never', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };

    let x =          hot('--a--b--c--|', xs);
    const xsubs =        '^          !';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('------------');
    const ysubs =        '^          !';

    const expected =     '-----------|';

    let calls = 0;
    const durationCounted = (v: TimeInterval) => {
      calls++;
      return duration(v);
    };

    const r = x.join(y, durationCounted, duration, concat)
      .do(undefined, undefined, () => expect(calls).to.equal(3));
    expectObservable(r).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const xs = { a: ti('first0'), b: ti('first1'), c: ti('first2') };
    const ys = { d: ti('second0'), e: ti('second1'), f: ti('second2') };

    let x =          hot('--a--b--c--|', xs);
    const unsub =        '       !    ';
    const xsubs =        '^      !    ';
    xs.a.interval = time(  '|         ');
    xs.b.interval = time(     '|      ');
    xs.c.interval = time(        '|   ');

    let y =          hot('--d--e--f--|', ys);
    const ysubs =        '^      !     ';
    ys.d.interval = time(  '|         ');
    ys.e.interval = time(     '|      ');
    ys.f.interval = time(        '|   ');

    const expected =       '--g--h--';
    const values = { g: 'first0second0', h: 'first1second1' };

    const r = x
      .mergeMap((v: TimeInterval) => Observable.of(v))
      .join(y, duration, duration, concat)
      .mergeMap((v: TimeInterval) => Observable.of(v));

    expectObservable(r, unsub).toBe(expected, values);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });
});
