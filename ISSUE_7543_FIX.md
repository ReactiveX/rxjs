# Fix for Issue #7543: `.next()` is available in observables returned by `.pipe()`

## Problem Description

The issue reported in [GitHub Issue #7543](https://github.com/ReactiveX/rxjs/issues/7543) describes unexpected behavior where calling `.pipe()` on a Subject returns an observable that still has access to the `.next()` method from the original Subject.

### Example of the Problem

```typescript
const mySubj$ = new Subject();
const doubled$ = mySubj$.pipe(map((v) => v * 2));

// This works as expected
mySubj$.next(1); // Logs: Original value: 1, Doubled value: 2

// This should NOT work but does in the problematic version
doubled$.next(3); // Logs: Original value: 3, Doubled value: 6
```

### Expected Behavior

According to TypeScript types, `.pipe()` should return an `Observable` (which doesn't have `.next()`), not a Subject. The piped observable should be a pure Observable without Subject-specific methods.

## Root Cause Analysis

The issue stems from how the `pipe` method is implemented in the `Observable` class:

```typescript
pipe(...operations: UnaryFunction<any, any>[]): unknown {
  return operations.reduce(pipeReducer, this as any);
}
```

When operations are provided, they should create new Observable instances, but in some cases, the result might still inherit properties from the original Subject due to prototype chain or implementation details.

## Solution

The fix involves overriding the `pipe` method in the `Subject` class to ensure that when operations are provided, the result is always a pure Observable without Subject-specific methods.

### Implementation

Added the following method to the `Subject` class in `packages/rxjs/src/internal/Subject.ts`:

```typescript
/**
 * Override pipe method to ensure that when operations are provided,
 * the result is a pure Observable without Subject-specific methods.
 * This fixes issue #7543 where .next() was available on piped observables.
 */
pipe(...operations: any[]): any {
  if (operations.length === 0) {
    return this;
  }
  // Use asObservable() to ensure the result is a pure Observable
  return this.asObservable().pipe(...operations);
}
```

### How the Fix Works

1. **No Operations**: When `pipe()` is called with no arguments, it returns `this` (the Subject itself) for backward compatibility.

2. **With Operations**: When operations are provided, the method calls `this.asObservable().pipe(...operations)`, which:
   - Creates a pure Observable using `asObservable()`
   - Applies the operations to that Observable
   - Returns a result that doesn't inherit Subject-specific methods

### Benefits

- **Type Safety**: The returned observable is a pure Observable without Subject methods
- **Backward Compatibility**: Empty `pipe()` calls still work as before
- **Inheritance**: The fix automatically applies to all Subject variants (BehaviorSubject, ReplaySubject, AsyncSubject) since they extend Subject

## Testing

Added comprehensive tests in `packages/rxjs/spec/Subject-spec.ts` to verify:

1. Piped observables don't have `next` method
2. Piped observables are Observable instances, not Subject instances
3. The fix works with all Subject variants
4. Backward compatibility is maintained
5. Multiple operators work correctly

### Test Examples

```typescript
it('should not expose next method on piped observables from Subject', () => {
  const subject = new Subject<number>();
  const piped = subject.pipe(map(x => x * 2));
  
  expect(piped).to.be.instanceOf(Observable);
  expect(piped).to.not.be.instanceOf(Subject);
  expect((piped as any).next).to.be.undefined;
});
```

## Impact

- **Breaking Changes**: None - the fix maintains backward compatibility
- **Performance**: Minimal impact - only affects Subject.pipe() calls with operations
- **Type Safety**: Improved - piped observables are now properly typed as Observable
- **Developer Experience**: Better - eliminates confusing behavior where Subject methods were available on piped observables

## Workaround (No Longer Needed)

Previously, developers had to use:
```typescript
const doubled$ = mySubj$.asObservable().pipe(map((v) => v * 2));
```

With this fix, the standard approach now works correctly:
```typescript
const doubled$ = mySubj$.pipe(map((v) => v * 2));
```
