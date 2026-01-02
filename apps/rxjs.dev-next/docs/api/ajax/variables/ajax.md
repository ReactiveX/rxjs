[API](../../index.md) / [ajax](../index.md) / ajax

# Variable: ajax

> There is an ajax operator on the Rx object.

## Description

It creates an observable for an Ajax request with either a request object with
url, headers, etc or a string for a URL.

```ts
const ajax: AjaxCreationMethod;
```

Defined in: [rxjs/src/internal/ajax/ajax.ts:268](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ajax/ajax.ts#L268)

There is an ajax operator on the Rx object.

It creates an observable for an Ajax request with either a request object with
url, headers, etc or a string for a URL.

## Example

Using `ajax()` to fetch the response object that is being returned from API

```ts
import { ajax } from 'rxjs/ajax';
import { map, catchError, of } from 'rxjs';

const obs$ = ajax('https://api.github.com/users?per_page=5').pipe(
  map((userResponse) => console.log('users: ', userResponse)),
  catchError((error) => {
    console.log('error: ', error);
    return of(error);
  })
);

obs$.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log(err),
});
```

Using `ajax.getJSON()` to fetch data from API

```ts
import { ajax } from 'rxjs/ajax';
import { map, catchError, of } from 'rxjs';

const obs$ = ajax.getJSON('https://api.github.com/users?per_page=5').pipe(
  map((userResponse) => console.log('users: ', userResponse)),
  catchError((error) => {
    console.log('error: ', error);
    return of(error);
  })
);

obs$.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log(err),
});
```

Using `ajax()` with object as argument and method POST with a two seconds delay

```ts
import { ajax } from 'rxjs/ajax';
import { map, catchError, of } from 'rxjs';

const users = ajax({
  url: 'https://httpbin.org/delay/2',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'rxjs-custom-header': 'Rxjs',
  },
  body: {
    rxjs: 'Hello World!',
  },
}).pipe(
  map((response) => console.log('response: ', response)),
  catchError((error) => {
    console.log('error: ', error);
    return of(error);
  })
);

users.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log(err),
});
```

Using `ajax()` to fetch. An error object that is being returned from the request

```ts
import { ajax } from 'rxjs/ajax';
import { map, catchError, of } from 'rxjs';

const obs$ = ajax('https://api.github.com/404').pipe(
  map((userResponse) => console.log('users: ', userResponse)),
  catchError((error) => {
    console.log('error: ', error);
    return of(error);
  })
);

obs$.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log(err),
});
```
