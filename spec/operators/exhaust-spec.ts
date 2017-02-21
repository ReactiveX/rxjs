import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {exhaust} */
describe('Observable.prototype.exhaust', () => {
  asDiagram('exhaust')('should handle a hot observable of hot observables', () => {
    const x =   cold(      '--a---b---c--|               ');
    const y =   cold(              '---d--e---f---|      ');
    const z =   cold(                    '---g--h---i---|');
    const e1 = hot(  '------x-------y-----z-------------|', { x: x, y: y, z: z });
    const expected = '--------a---b---c------g--h---i---|';

    expectObservable((<any>e1).exhaust()).toBe(expected);
  });

  it('should switch to first immediately-scheduled inner Observable', () => {
    const e1 = cold( '(ab|)');
    const e1subs =   '(^!)';
    const e2 = cold( '(cd|)');
    const e2subs = [];
    const expected = '(ab|)';

    expectObservable((<any>Observable.of(e1, e2)).exhaust()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a hot observable of observables', () => {
    const x = cold(        '--a---b---c--|               ');
    const xsubs =    '      ^            !               ';
    const y = cold(                '---d--e---f---|      ');
    const ysubs = [];
    const z = cold(                      '---g--h---i---|');
    const zsubs =    '                    ^             !';
    const e1 = hot(  '------x-------y-----z-------------|', { x: x, y: y, z: z });
    const expected = '--------a---b---c------g--h---i---|';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a hot observable of observables, outer is unsubscribed early', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^         !           ';
    const y = cold(                '---d--e---f---|');
    const ysubs = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const unsub =    '                !            ';
    const expected = '--------a---b---             ';

    expectObservable((<any>e1).exhaust(), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^         !           ';
    const y = cold(                '---d--e---f---|');
    const ysubs = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const unsub =    '                !            ';
    const expected = '--------a---b----            ';

    const result = (<any>e1)
      .mergeMap((x: any) => Observable.of(x))
      .exhaust()
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, inner never completes', () => {
    const x = cold(     '--a---b--|              ');
    const xsubs =    '   ^        !              ';
    const y = cold(          '-d---e-            ');
    const ysubs = [];
    const z = cold(                '---f--g---h--');
    const zsubs =    '              ^            ';
    const e1 = hot(  '---x---y------z----------| ', { x: x, y: y, z: z });
    const expected = '-----a---b-------f--g---h--';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
  });

  it('should handle a synchronous switch and stay on the first inner observable', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      ^            !   ';
    const y = cold(        '---d--e---f---|  ');
    const ysubs = [];
    const e1 = hot(  '------(xy)------------|', { x: x, y: y });
    const expected = '--------a---b---c-----|';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, one inner throws', () => {
    const x = cold(        '--a---#                ');
    const xsubs =    '      ^     !                ';
    const y = cold(                '---d--e---f---|');
    const ysubs = [];
    const e1 = hot(  '------x-------y------|       ', { x: x, y: y });
    const expected = '--------a---#                ';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle a hot observable of observables, outer throws', () => {
    const x = cold(        '--a---b---c--|         ');
    const xsubs =    '      ^            !         ';
    const y = cold(                '---d--e---f---|');
    const ysubs = [];
    const e1 = hot(  '------x-------y-------#      ', { x: x, y: y });
    const expected = '--------a---b---c-----#      ';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
  });

  it('should handle an empty hot observable', () => {
    const e1 = hot(  '------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never hot observable', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete not before the outer completes', () => {
    const x = cold(        '--a---b---c--|   ');
    const xsubs =    '      ^            !   ';
    const e1 = hot(  '------x---------------|', { x: x });
    const expected = '--------a---b---c-----|';

    expectObservable((<any>e1).exhaust()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
  });

  it('should handle an observable of promises', (done: MochaDone) => {
    const expected = [1];

    (<any>Observable.of(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)))
      .exhaust()
      .subscribe((x: number) => {
        expect(x).to.equal(expected.shift());
      }, null, () => {
        expect(expected.length).to.equal(0);
        done();
      });
  });

  it('should handle an observable of promises, where one rejects', (done: MochaDone) => {
    (<any>Observable.of<any>(Promise.reject(2), Promise.resolve(1)))
      .exhaust()
      .subscribe((x: any) => {
        done(new Error('should not be called'));
      }, (err: any) => {
        expect(err).to.equal(2);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });
});
