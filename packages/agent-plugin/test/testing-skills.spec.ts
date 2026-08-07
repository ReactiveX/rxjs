import 'rxjs';
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { TestScheduler } from 'rxjs7/testing';
import { map as map7 } from 'rxjs7/operators';

describe('version-specific testing skill examples', () => {
  it('runs the documented RxJS 7 TestScheduler pattern', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const sourceMarbles = '       -a-b-|';
      const expectedMarbles = '     -x-y-|';
      const sourceSubscriptions = ' ^----!';
      const source = cold(sourceMarbles, { a: 1, b: 2 });

      expectObservable(source.pipe(map7((value) => value * 10))).toBe(expectedMarbles, {
        x: 10,
        y: 20,
      });
      expectSubscriptions(source.subscriptions).toBe(sourceSubscriptions);
    });
  });

  it('runs the documented RxJS 9 platform-source pattern', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const sourceMarbles = '       --a--b--|';
      const expectedMarbles = '     --x--y--|';
      const secondWindow = '        ---^------!';
      const secondExpected = '      -----b--|';
      const producerWindow = '      ^-------!';
      const source = observable(sourceMarbles, { a: 1, b: 2 });

      expectObservable(source.map((value) => value * 10)).toBe(expectedMarbles, {
        x: 10,
        y: 20,
      });
      expectObservable(source, secondWindow).toBe(secondExpected, { b: 2 });
      expectSubscriptions(source.subscriptions).toBe(producerWindow);
    });
  });

  it('supports aligned long-duration annotations in RxJS 7 and RxJS 9', async () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    scheduler.run(({ cold, expectObservable }) => {
      const sourceMarbles = '   --- 10s ---a--b--|';
      const expectedMarbles = ' --- 10s ---x--y--|';
      const source = cold(sourceMarbles, { a: 1, b: 2 });

      expectObservable(source.pipe(map7((value) => value * 10))).toBe(expectedMarbles, {
        x: 10,
        y: 20,
      });
    });

    await rxTest(({ observable, expectObservable }) => {
      const sourceMarbles = '   --- 10s ---a--b--|';
      const expectedMarbles = ' --- 10s ---x--y--|';
      const source = observable(sourceMarbles, { a: 1, b: 2 });

      expectObservable(source.map((value) => value * 10)).toBe(expectedMarbles, {
        x: 10,
        y: 20,
      });
    });
  });

  it('models an RxJS 9 owner abort with subscription marbles', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const sourceMarbles = '       -a-b-c-d-|';
      const ownerWindow = '         ^----!';
      const expected = '            -a-b-';
      const producerWindow = '      ^----!';
      const source = observable(sourceMarbles);

      expectObservable(source, ownerWindow).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(producerWindow);
    });
  });

  it('distinguishes platform sharing from valid cold source modeling', async () => {
    await rxTest(({ cold, observable, expectObservable, expectSubscriptions }) => {
      const sourceMarbles = '           --a--|';
      const firstWindow = '             ^------!';
      const secondWindow = '            -^------!';
      const sharedExpected = '          --a--|';
      const coldSecondExpected = '      ---a--|';
      const sharedProducer = '          ^----!';
      const coldProducers = [
        '                               ^----!',
        '                               -^----!',
      ];
      const sharedSource = observable(sourceMarbles);
      const coldSource = cold(sourceMarbles);

      expectObservable(sharedSource, firstWindow).toBe(sharedExpected);
      expectObservable(sharedSource, secondWindow).toBe(sharedExpected);
      expectSubscriptions(sharedSource.subscriptions).toBe(sharedProducer);

      expectObservable(coldSource, firstWindow).toBe(sharedExpected);
      expectObservable(coldSource, secondWindow).toBe(coldSecondExpected);
      expectSubscriptions(coldSource.subscriptions).toBe(coldProducers);
    });
  });
});
