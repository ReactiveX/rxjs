/** @prettier */
import { expect } from 'chai';
import { connectable, of, ReplaySubject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

describe('connectable', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should mirror a simple source Observable', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';

      const obs = connectable(source);

      expectObservable(obs).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);

      obs.connect();
    });
  });

  it('should do nothing if connect is not called, despite subscriptions', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs: string[] = [];
      const expected = '   -';

      const obs = connectable(source);

      expectObservable(obs).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });

  it('should support resetOnDisconnect = true', () => {
    const values: number[] = [];
    const source = of(1, 2, 3);
    const obs = connectable(source, {
      connector: () => new ReplaySubject(1),
      resetOnDisconnect: true,
    });

    obs.subscribe((value) => values.push(value));
    const connection = obs.connect();
    expect(values).to.deep.equal([1, 2, 3]);

    connection.unsubscribe();

    obs.subscribe((value) => values.push(value));
    obs.connect();
    expect(values).to.deep.equal([1, 2, 3, 1, 2, 3]);
  });

  it('should support resetOnDisconnect = false', () => {
    const values: number[] = [];
    const source = of(1, 2, 3);
    const obs = connectable(source, {
      connector: () => new ReplaySubject(1),
      resetOnDisconnect: false,
    });

    obs.subscribe((value) => values.push(value));
    const connection = obs.connect();
    expect(values).to.deep.equal([1, 2, 3]);

    connection.unsubscribe();

    obs.subscribe((value) => values.push(value));
    obs.connect();
    expect(values).to.deep.equal([1, 2, 3, 3]);
  });
});
