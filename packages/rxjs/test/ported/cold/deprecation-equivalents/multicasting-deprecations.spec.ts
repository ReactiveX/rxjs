// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/deprecation-equivalents/multicasting-deprecations-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { AsyncSubject } from 'rxjs/async-subject';
import { behaviorSubject as createBehaviorSubject } from 'rxjs/behavior-subject';
import { ColdObservable } from 'rxjs/cold-observable';
import { connect } from 'rxjs/connect';
import { merge } from 'rxjs/merge';
import { multicast } from 'rxjs/multicast';
import { publish } from 'rxjs/publish';
import { publishBehavior } from 'rxjs/publish-behavior';
import { publishLast } from 'rxjs/publish-last';
import { publishReplay } from 'rxjs/publish-replay';
import { refCount } from 'rxjs/ref-count';
import { repeat } from 'rxjs/repeat';
import { replaySubject as createReplaySubject } from 'rxjs/replay-subject';
import { retry } from 'rxjs/retry';
import { share } from 'rxjs/share';
import { Subject } from 'rxjs/subject';
describe('multicasting-deprecations (cold)', () => {
  it('should be equivalent for multicast(() => new Subject()), refCount() and share() for async sources', async () => {
    const oldExpression = (source) => source[multicast](() => new Subject())[refCount]();
    const updatedExpression = (source) => source[share]();
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[multicast](new Subject())[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publish]()[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publishLast]()[refCount]();
    const updatedExpression = (source) =>
      source[share]({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publishBehavior]('X')[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createBehaviorSubject('X'),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publishReplay](3, 10)[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createReplaySubject({ size: 3, maxAge: 10 }),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(fn) and connect({ setup: fn }) for async sources', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publish](fn);
    const updatedExpression = (source) => source[connect](fn);
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publishReplay](3, 10, fn);
    const updatedExpression = (source) => {
      const subject = createReplaySubject({ size: 3, maxAge: 10 });
      return source[connect](fn, { connector: () => subject });
    };
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(() => new Subject()), refCount() and share() for async sources that repeat', async () => {
    const oldExpression = (source) => source[multicast](() => new Subject())[refCount]();
    const updatedExpression = (source) => source[share]();
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[multicast](new Subject())[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publish]()[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publishLast]()[refCount]();
    const updatedExpression = (source) =>
      source[share]({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publishBehavior]('X')[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createBehaviorSubject('X'),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publishReplay](3, 10)[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createReplaySubject({ size: 3, maxAge: 10 }),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(fn) and connect({ setup: fn }) for async sources that repeat', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publish](fn);
    const updatedExpression = (source) => source[connect](fn);
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources that repeat', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publishReplay](3, 10, fn);
    const updatedExpression = (source) => {
      const subject = createReplaySubject({ size: 3, maxAge: 10 });
      return source[connect](fn, { connector: () => subject });
    };
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----|');
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(() => new Subject()), refCount() and share() for async sources that retry', async () => {
    const oldExpression = (source) => source[multicast](() => new Subject())[refCount]();
    const updatedExpression = (source) => source[share]();
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[multicast](new Subject())[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publish]()[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publishLast]()[refCount]();
    const updatedExpression = (source) =>
      source[share]({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publishBehavior]('X')[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createBehaviorSubject('X'),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publishReplay](3, 10)[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createReplaySubject({ size: 3, maxAge: 10 }),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(fn) and connect({ setup: fn }) for async sources that retry', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publish](fn);
    const updatedExpression = (source) => source[connect](fn);
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources that retry', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publishReplay](3, 10, fn);
    const updatedExpression = (source) => {
      const subject = createReplaySubject({ size: 3, maxAge: 10 });
      return source[connect](fn, { connector: () => subject });
    };
    await rxTest(({ cold, expectObservable }) => {
      const source = cold('----a---b---c----d---e----#');
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(() => new Subject()), refCount() and share() for async sources', async () => {
    const oldExpression = (source) => source[multicast](() => new Subject())[refCount]();
    const updatedExpression = (source) => source[share]();
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[multicast](new Subject())[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publish]()[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publishLast]()[refCount]();
    const updatedExpression = (source) =>
      source[share]({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publishBehavior]('X')[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createBehaviorSubject('X'),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources', async () => {
    const oldExpression = (source) => source[publishReplay](3, 10)[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createReplaySubject({ size: 3, maxAge: 10 }),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(fn) and connect({ setup: fn }) for async sources', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publish](fn);
    const updatedExpression = (source) => source[connect](fn);
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publishReplay](3, 10, fn);
    const updatedExpression = (source) => {
      const subject = createReplaySubject({ size: 3, maxAge: 10 });
      return source[connect](fn, { connector: () => subject });
    };
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source);
      const updated = updatedExpression(source);
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(() => new Subject()), refCount() and share() for async sources that repeat', async () => {
    const oldExpression = (source) => source[multicast](() => new Subject())[refCount]();
    const updatedExpression = (source) => source[share]();
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[multicast](new Subject())[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publish]()[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publishLast]()[refCount]();
    const updatedExpression = (source) =>
      source[share]({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publishBehavior]('X')[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createBehaviorSubject('X'),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that repeat', async () => {
    const oldExpression = (source) => source[publishReplay](3, 10)[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createReplaySubject({ size: 3, maxAge: 10 }),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(fn) and connect({ setup: fn }) for async sources that repeat', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publish](fn);
    const updatedExpression = (source) => source[connect](fn);
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources that repeat', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publishReplay](3, 10, fn);
    const updatedExpression = (source) => {
      const subject = createReplaySubject({ size: 3, maxAge: 10 });
      return source[connect](fn, { connector: () => subject });
    };
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[repeat]({ count: 3 });
      const updated = updatedExpression(source)[repeat]({ count: 3 });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(() => new Subject()), refCount() and share() for async sources that retry', async () => {
    const oldExpression = (source) => source[multicast](() => new Subject())[refCount]();
    const updatedExpression = (source) => source[share]();
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for multicast(new Subject()), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[multicast](new Subject())[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(), refCount() and share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publish]()[refCount]();
    const updatedExpression = (source) => source[share]({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishLast(), refCount() and share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publishLast]()[refCount]();
    const updatedExpression = (source) =>
      source[share]({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishBehavior("X"), refCount() and share({ connector: () => new BehaviorSubject("X"), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publishBehavior]('X')[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createBehaviorSubject('X'),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10), refCount() and share({ connector: () => new ReplaySubject(3, 10), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }) for async sources that retry', async () => {
    const oldExpression = (source) => source[publishReplay](3, 10)[refCount]();
    const updatedExpression = (source) =>
      source[share]({
        connector: () => createReplaySubject({ size: 3, maxAge: 10 }),
        resetOnError: false,
        resetOnComplete: false,
        resetOnRefCountZero: false,
      });
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publish(fn) and connect({ setup: fn }) for async sources that retry', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publish](fn);
    const updatedExpression = (source) => source[connect](fn);
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
  it('should be equivalent for publishReplay(3, 10, fn) and `subject = new ReplaySubject(3, 10), connect({ connector: () => subject , setup: fn })` for async sources that retry', async () => {
    const fn = (source) => ColdObservable[merge]([source, source]);
    const oldExpression = (source) => source[publishReplay](3, 10, fn);
    const updatedExpression = (source) => {
      const subject = createReplaySubject({ size: 3, maxAge: 10 });
      return source[connect](fn, { connector: () => subject });
    };
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable.from(['a', 'b', 'c']);
      const old = oldExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      const updated = updatedExpression(source)[retry]({ count: 3, resetOnSuccess: false });
      expectObservable(updated).toEqual(old);
    });
  });
});
