# Deprecations

## VERSION UNKNOWN

The following operator names were changed because their dot-chained names are reserved words in JavaScript:

* `do` -> `tap`
* `catch` -> `catchError`
* `switch` -> `switchAll`
* `finally` -> `finalize`

To convert dot-chained operators to pipeable operators, wrap all operators in the `pipe()` method from the source observable, remove the dots, and add commas to pass each operation to `pipe()` as an argument.

For example, the following code uses chaining:

```typescript
source
 .map(x => x + x)
 .mergeMap(n => of(n + 1, n + 2)
   .filter(x => x % 1 == 0)
   .scan((acc, x) => acc + x, 0)
 )
 .catch(err => of('error found'))
 .subscribe(printResult);
```

To convert to piping:

```typescript
source.pipe(
 map(x => x + x),
 mergeMap(n => of(n + 1, n + 2).pipe(
   filter(x => x % 1 == 0),
   scan((acc, x) => acc + x, 0),
 )),
 catchError(err => of('error found')),
).subscribe(printResult); 
```


<a id="deprecations-6.0.0-rc.0"></a>
## Deprecations introduced in version 6.0.0-rc.0 (2018-03-31)**

* Result selectors


* The parameter has been *removed *from the first() and last() operators in v6, but is supported by the rxjs-compat package. You must update your code in order to drop the compatibility package.

* The parameter is *deprecated *in the following operators, and will be removed in v7. You must update your code before moving to the v7.

    * mergeMap()
    * mergeMapTo()
    * concatMap()
    * concatMapTo()
    * switchMap
    * switchMapTo()
    * exhaustMap()
    * forkJoin()
    * zip()
    * combineLatest()
    * fromEvent()  

**first()**

* with resultSelector (v5.x)
```typescript
source.pipe(
 first(predicate, resultSelector, defaultValue)
) 
```

* without resultSelector (if you're not using the index in it):

```typescript
source.pipe(
 first(predicate, defaultValue),
 map(resultSelector)
) 
```
* without resultSelector (if you ARE using the index in it)

``` ts
source.pipe(
 map((v, i) => [v, i]),
 first(([v, i]) => predicate(v, i)),
 map(([v, i]) => resultSelector(v, i)),
)
```

**last()**

* with resultSelector (v5.x)

```typescript
source.pipe(
 last(predicate, resultSelector, defaultValue)
) 
```

* without resultSelector (if you're not using the index in it):

```typescript
source.pipe(
 last(predicate, defaultValue),
 map(resultSelector)
)
```

* without resultSelector (if you ARE using the index in it)

```typescript
source.pipe(
 map((v, i) => [v, i]),
 last(([v, i]) => predicate(v, i)),
 map(([v, i]) => resultSelector(v, i)),
)
```



## Deprecations introduced in version 6.0.0-tactical-rc.1 (2018-04-07)**
- [!!!! IMPLEMENT EXAMPLE !!!!] [Scheduler - class - implement own scheduler instead ](https://github.com/ReactiveX/rxjs/blob/01a09789a0a9484c368b7bd6ed37f94d25490a00/src/internal/Scheduler.ts#L20)

<a id="remove-7.x_never-method"></a>
### Static method `never` removed
Deprecated in version [6.0.0.beta-4](#deprecations-6.0.0-beta.4_never_method-to-constant) see refactoring suggestions there
- [ ] [rxjs-compat removed here]()
