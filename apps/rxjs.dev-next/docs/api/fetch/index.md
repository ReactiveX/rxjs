[API](../index.md) / fetch

# fetch

> The module for the RxJS DOM Fetch API.

## Description

This is exported separately from the RxJS core API to avoid bringing DOM types into Node.js projects.

The module for the RxJS DOM Fetch API.

This is exported separately from the RxJS core API to avoid bringing DOM types into Node.js projects.

## Example

```ts
import { fromFetch } from 'rxjs/fetch';
import { switchMap, of, catchError } from 'rxjs';

const data$ = fromFetch('https://api.github.com/users?per_page=5').pipe(
  switchMap((response) => {
    if (response.ok) {
      return response.json();
    }
  }),
  catchError((err) => {
    console.error(err);
    return of({ error: true, message: err.message });
  })
);

data$.subscribe((result) => console.log(result));

// Output:
// { name: 'John Doe', email: 'john.doe@example.com' }
```

## Functions

- [fromFetch](functions/fromFetch.md)
