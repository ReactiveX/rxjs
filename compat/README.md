# RxJS Compatibility Package

This package is required to get backwards compatibility with RxJS previous to version 6. It contains the imports to add operators to `Observable.prototype` and creation methods to `Observable`. This is what allows, for instance, dot-chaining:

```
Observable.interval(1)
  .map(i => i * i)
```

vs

```
Observable.interval(1)
  .pipe(map(i => i * i))
```
