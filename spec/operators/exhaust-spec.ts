import { expect } from 'chai';
import { exhaust, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, OperatorFunction, Observable } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const type: Function;

/** @test {exhaust} */
describe('exhaust operator', () => {
  asDiagram('exhaust')('should handle a hot observable of hot observables', () => {
    const x =   cold(      '--a---b---c--|               ');
    const y =   cold(              '---d--e---f---|      ');
    const z =   cold(                    '---g--h---i---|');
    const e1 = hot(  '------x-------y-----z-------------|', { x: x, y: y, z: z });
    const expected = '--------a---b---c------g--h---i---|';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
  });

  it('should switch to first immediately-scheduled inner Observable', () => {
    const e1 = cold( '(ab|)');
    const e1subs =   '(^!)';
    const e2 = cold( '(cd|)');
    const e2subs: string[] = [];
    const expected = '(ab|)';

    expectObservable(of(e1, e2).pipe(exhaust())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a hot observable of observables', () => {
    const x = cold(        '--a---b---c--|               ');
    const xsubs =    '      ^            !               ';
    const y = cold(                '---d--e---f---|      ');
    const ysubs: string[] = [];
    const z = cold(                      '---g--h---i---|');
    const zsubs =    '                    ^             !';
    const e1 = hot(  '------x-------y-----z-------------|', { x: x, y: y, z: z });
    const expected = '--------a---b---c------g--h---i---|';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^         !           ';
    const y = cold(                '---d--e---f---|');
    const ysubs: string[] = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const unsub =    '                !            ';
    const expected = '--------a---b---             ';

    expectObservable(e1.pipe(exhaust()), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^         !           ';
    const y = cold(                '---d--e---f---|');
    const ysubs: string[] = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const unsub =    '                !            ';
    const expected = '--------a---b----            ';

    const result = e1.pipe(
      mergeMap((x) => of(x)),
      exhaust(),
      mergeMap((x) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, inner never completes', () => {
    const x = cold(     '--a---b--|              ');
    const xsubs =    '   ^        !              ';
    const y = cold(          '-d---e-            ');
    const ysubs: string[] = [];
    const z = cold(                '---f--g---h--');
    const zsubs =    '              ^            ';
    const e1 = hot(  '---x---y------z----------| ', { x: x, y: y, z: z });
    const expected = '-----a---b-------f--g---h--';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a synchronous switch and stay on the first inner observable', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      ^            !   ';
    const y = cold(        '---d--e---f---|  ');
    const ysubs: string[] = [];
    const e1 = hot(  '------(xy)------------|', { x: x, y: y });
    const expected = '--------a---b---c-----|';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, one inner throws', () => {
    const x = cold(        '--a---#                ');
    const xsubs =    '      ^     !                ';
    const y = cold(                '---d--e---f---|');
    const ysubs: string[] = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---#                ';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer throws', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^            !         ';
    const y = cold(                '---d--e---f---|');
    const ysubs: string[] = [];
    const e1 = hot(  '------x-------y-------#      ', { x: x, y: y });
    const expected = '--------a---b---c-----#      ';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle an empty hot observable', () => {
    const e1 = hot(  '------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never hot observable', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete not before the outer completes', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      ^            !   ';
    const e1 = hot(  '------x---------------|', { x: x });
    const expected = '--------a---b---c-----|';

    expectObservable(e1.pipe(exhaust())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should handle an observable of promises', (done) => {
    const expected = [1];

    of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)).pipe(
      exhaust()
    ).subscribe((x) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should handle an observable of promises, where one rejects', (done) => {
    of(Promise.reject(2), Promise.resolve(1)).pipe(
      exhaust<never | number>()
    ).subscribe((x) => {
        done(new Error('should not be called'));
      }, (err) => {
        expect(err).to.equal(2);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number> = of(source1, source2, source3)
      .pipe(exhaust());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number> = of(source1, source2, source3)
      .pipe(exhaust());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string> = of(<any>source1, <any>source2, <any>source3)
      .pipe(exhaust<string>());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string> = of(<any>source1, <any>source2, <any>source3)
      .pipe(exhaust<string>());
    /* tslint:enable:no-unused-variable */
  });
});
