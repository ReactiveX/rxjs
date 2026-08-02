# RxJS Next (planned RxJS 9)

RxJS Next is a platform-based generation of RxJS under active development on `master`. RxJS 7 remains the stable release for production users today.

## Package model

- **`@rxjs/observable-polyfill`** provides the web-platform `Observable` contract when the host does not already provide a conforming implementation.
- **`rxjs`** exports exact Symbol keys and focused subpaths for RxJS behavior. Symbol-based RxJS operators coexist with platform string methods such as `map` and `filter`.
- **`@rxjs/test`** contains the test-facing utilities for the new runtime model.
- **`@rxjs/migrate`** analyzes applications and helps plan migration from RxJS 7.

## Semantics

The platform layer uses `AbortSignal` and the platform subscriber lifecycle as its cancellation foundation. RxJS 7 cold-observable compatibility is kept behind an explicit compatibility boundary instead of silently changing the platform contract.

The implementation is exploratory and the prerelease contract can still change. For the accepted architecture, decisions, compatibility policy, and current execution status, see the [RxJS Next project documentation](https://github.com/ReactiveX/rxjs/tree/master/docs/rxjs-next).

## API reference

The [generated API reference](/api) is built directly from the public exports in the current `master` packages.
