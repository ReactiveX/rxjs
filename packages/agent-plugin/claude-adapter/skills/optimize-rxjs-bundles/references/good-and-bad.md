# Good and bad bundle changes

## Remove an unnecessary extension

```ts
// Good when the platform contract fits.
const output = source.map(project);

// Larger in that same scenario because it imports/installs an extension.
import { map } from 'rxjs/map';
const output = source[map](project);
```

The second form is correct for a semantic difference or a `ColdObservable`
result that must retain its lifecycle.

## Measure comparable output

```text
Good: same production entry, targets, minifier, splitting, and compression;
      module graph plus executed behavior attached.
Bad:  compares a development build before with a minified build after.
```

## Preserve side effects

```ts
// Bad optimization: marks every RxJS 9 subpath side-effect-free and lets the
// bundler remove required Symbol installation.
```

## Preserve behavior

Do not replace sequential queueing with switching, remove recovery, expose a
Subject, or share a producer merely to shrink bytes. A delete result discarded
by `switchMap` can leave client state stale even if the bundle is smaller.
