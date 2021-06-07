# Multicasting

In version 7, the multicasting APIs were simplified to just a few functions:

- [connectable](/api/index/function/connectable)
- [connect](/api/operators/connect)
- [share](/api/operators/share)

And [shareReplay](/api/operators/shareReplay) - which is a thin wrapper around the now highly-configurable [share](/api/operators/share) operator.

Other APIs that relate to multicasting are now deprecated.

<div class="alert is-important">
    <span>
        These deprecations were introduced in RxJS 7.0 and will become breaking in RxJS 8.
    </span>
</div>

## APIs affected by this Change

- [ConnectableObservable](/api/index/class/ConnectableObservable)
- [multicast](/api/operators/multicast)
- [publish](/api/operators/publish)
- [publishBehavior](/api/operators/publishBehavior)
- [publishLast](/api/operators/publishLast)
- [publishReplay](/api/operators/publishReplay)
- [refCount](/api/operators/refCount)

## How to refactor

### ConnectableObservable

Instead of creating a [ConnectableObservable](/api/index/class/ConnectableObservable) instance, call the [connectable](/api/index/function/connectable) function to obtain a connectable observable.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, Subject, timer } from 'rxjs';
// deprecated
const tick$ = new ConnectableObservable(
  timer(1_000),
  () => new Subject());
tick$.connect();
```

<!-- prettier-ignore -->
```ts
import { connectable, Subject, timer } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject()
});
tick$.connect();
```

In situations in which the `refCount` method is used, the [share](/api/operators/share) operator can be used instead.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, Subject, timer } from 'rxjs';
// deprecated
const tick$ = new ConnectableObservable(
  timer(1_000),
  () => new Subject()
).refCount();
```

<!-- prettier-ignore -->
```ts
import { Subject, timer } from 'rxjs';
import { share } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  share({ connector: () => new Subject() })
);
```

### multicast

Where [multicast](/api/operators/multicast) is called with a subject factory, can be replaced with [connectable](/api/index/function/connectable).

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, timer, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  multicast(() => new Subject())
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->
```ts
import { connectable, timer, Subject } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject()
});
```

Where [multicast](/api/operators/multicast) is called with a subject instance, it can be replaced with [connectable](/api/index/function/connectable) and a local subject instance.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, timer, Subject } from 'rxjs';
import { multicast } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  multicast(new Subject())
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->
```ts
import { connectable, timer, Subject } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject(),
  resetOnDisconnect: false
});
```

Where [multicast](/api/operators/multicast) is used in conjunction with [refCount](/api/operators/refCount), it can be replaced with [share](/api/index/function/connectable).

<!-- prettier-ignore -->
```ts
import { timer, Subject } from 'rxjs';
import { multicast, refCount } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  multicast(() => new Subject()),
  refCount()
);
```

<!-- prettier-ignore -->
```ts
import { timer, Subject } from 'rxjs';
import { share } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  share({ connector: () => new Subject() })
);
```

Where [multicast](/api/operators/multicast) is used with a selector, it can be replaced with [connect](/api/index/function/connect).

<!-- prettier-ignore -->
```ts
import { timer, combineLatest } from 'rxjs';
import { multicast } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  multicast(
    () => new Subject(),
    (source) => combineLatest([source, source])
  )
);
```

<!-- prettier-ignore -->
```ts
import { timer, combineLatest } from 'rxjs';
import { connect } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  connect((source) => combineLatest([source, source]), {
    connector: () => new Subject()
  })
);
```

### publish

If you're using [publish](/api/operators/publish) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) instead.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, timer } from 'rxjs';
import { publish } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publish()
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->
```ts
import { connectable, timer } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new Subject<number>(),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publish](/api/operators/publish), you can use [share](/api/operators/share) to replace both.

<!-- prettier-ignore -->
```ts
import { timer } from 'rxjs';
import { publish, refCount } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publish(),
  refCount()
);
```

<!-- prettier-ignore -->
```ts
import { timer } from 'rxjs';
import { share } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false,
  })
);
```

If [publish](/api/operators/publish) is being called with a selector, you can use the [connect](/api/operators/connect) operator instead.

<!-- prettier-ignore -->
```ts
import { timer, combineLatest } from 'rxjs';
import { publish } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publish((source) => combineLatest([source, source]))
);
```

<!-- prettier-ignore -->
```ts
import { timer, combineLatest } from 'rxjs';
import { connect } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  connect((source) => combineLatest([source, source]))
);
```

### publishBehavior

If you're using [publishBehavior](/api/operators/publishBehavior) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) and a [BehaviorSubject](api/index/class/BehaviorSubject) instead.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, timer } from 'rxjs';
import { publishBehavior } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishBehavior(0)
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->
```ts
import { connectable, timer, BehaviorSubject } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new BehaviorSubject(0),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publishBehavior](/api/operators/publishBehavior), you can use the [share](/api/operators/share) operator - with a [BehaviorSubject](api/index/class/BehaviorSubject) connector - to replace both.

<!-- prettier-ignore -->
```ts
import { timer } from 'rxjs';
import { publishBehavior, refCount } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishBehavior(0),
  refCount()
);
```

<!-- prettier-ignore -->
```ts
import { timer, BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    connector: () => new BehaviorSubject(0),
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false,
  })
);
```

### publishLast

If you're using [publishLast](/api/operators/publishLast) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) and an [AsyncSubject](api/index/class/AsyncSubject) instead.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, timer } from 'rxjs';
import { publishLast } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishLast()
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->
```ts
import { connectable, timer, AsyncSubject } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new AsyncSubject<number>(),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publishLast](/api/operators/publishLast), you can use the [share](/api/operators/share) operator - with an [AsyncSubject](api/index/class/AsyncSubject) connector - to replace both.

<!-- prettier-ignore -->
```ts
import { timer } from 'rxjs';
import { publishLast, refCount } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishLast(),
  refCount()
);
```

<!-- prettier-ignore -->
```ts
import { timer, AsyncSubject } from 'rxjs';
import { share } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    connector: () => new AsyncSubject(),
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false,
  })
);
```

### publishReplay

If you're using [publishReplay](/api/operators/publishReplay) to create a [ConnectableObservable](/api/index/class/ConnectableObservable), you can use [connectable](/api/index/function/connectable) and a [ReplaySubject](api/index/class/ReplaySubject) instead.

<!-- prettier-ignore -->
```ts
import { ConnectableObservable, timer } from 'rxjs';
import { publishReplay } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishReplay(1)
) as ConnectableObservable<number>;
```

<!-- prettier-ignore -->
```ts
import { connectable, timer, ReplaySubject } from 'rxjs';
// suggested refactor
const tick$ = connectable(timer(1_000), {
  connector: () => new ReplaySubject<number>(1),
  resetOnDisconnect: false
});
```

And if [refCount](/api/operators/refCount) is being applied to the result of [publishReplay](/api/operators/publishReplay), you can use the [share](/api/operators/share) operator - with a [ReplaySubject](api/index/class/ReplaySubject) connector - to replace both.

<!-- prettier-ignore -->
```ts
import { timer } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishReplay(1),
  refCount()
);
```

<!-- prettier-ignore -->
```ts
import { timer, ReplaySubject } from 'rxjs';
import { share } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  share({
    connector: () => new ReplaySubject(1),
    resetOnError: false,
    resetOnComplete: false,
    resetOnRefCountZero: false,
  })
);
```

If [publishReplay](/api/operators/publishReplay) is being called with a selector, you can use the [connect](/api/operators/connect) operator - with a [ReplaySubject](api/index/class/ReplaySubject) connector - instead.

<!-- prettier-ignore -->
```ts
import { timer, combineLatest } from 'rxjs';
import { publishReplay } from 'rxjs/operators';
// deprecated
const tick$ = timer(1_000).pipe(
  publishReplay(1, undefined, (source) => combineLatest([source, source]))
);
```

<!-- prettier-ignore -->
```ts
import { timer, combineLatest, ReplaySubject } from 'rxjs';
import { connect } from 'rxjs/operators';
// suggested refactor
const tick$ = timer(1_000).pipe(
  connect((source) => combineLatest([source, source]), {
    connector: () => new ReplaySubject(1)
  })
);
```

### refCount

Instead of applying the [refCount](/api/operators/refCount) operator to the [ConnectableObservable](/api/index/class/ConnectableObservable) obtained from a [multicast](/api/operators/multicast)
or [publish](/api/operators/publish) operator, use the [share](/api/operators/share) operator to replace both.

The properties passed to [share](/api/operators/share) will depend upon the operators that are being replaced. The refactors for using [refCount](/api/operators/refCount) with [multicast](/api/operators/multicast), [publish](/api/operators/publish), [publishBehavior](/api/operators/publishBehavior), [publishLast](/api/operators/publishLast) and [publishReplay](/api/operators/publishReplay) are detailed above.
