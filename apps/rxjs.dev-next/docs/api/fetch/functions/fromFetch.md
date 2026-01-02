[API](../../index.md) / [fetch](../index.md) / fromFetch

# Function: fromFetch()

> Uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to
> make an HTTP request.

## Description

:::warning
Parts of the fetch API are still experimental. `AbortController` is
required for this implementation to work and use cancellation appropriately.

Will automatically set up an internal [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
in order to finalize the internal `fetch` when the subscription tears down.

If a `signal` is provided via the `init` argument, it will behave like it usually does with
`fetch`. If the provided `signal` aborts, the error that `fetch` normally rejects with
in that scenario will be emitted as an error from the observable.

## Examples

### Basic use

```ts
import { fromFetch } from 'rxjs/fetch';
import { switchMap, of, catchError } from 'rxjs';

const data$ = fromFetch('https://api.github.com/users?per_page=5').pipe(
  switchMap((response) => {
    if (response.ok) {
      // OK return data
      return response.json();
    } else {
      // Server is returning a status requiring the client to try something else.
      return of({ error: true, message: `Error ${response.status}` });
    }
  }),
  catchError((err) => {
    // Network or other error, handle appropriately
    console.error(err);
    return of({ error: true, message: err.message });
  })
);

data$.subscribe({
  next: (result) => console.log(result),
  complete: () => console.log('done'),
});
```

### Use with Chunked Transfer Encoding

With HTTP responses that use [chunked transfer encoding](https://tools.ietf.org/html/rfc7230#section-3.3.1),
the promise returned by `fetch` will resolve as soon as the response's headers are
received.

That means the `fromFetch` observable will emit a `Response` - and will
then complete - before the body is received. When one of the methods on the
`Response` - like `text()` or `json()` - is called, the returned promise will not
resolve until the entire body has been received. Unsubscribing from any observable
that uses the promise as an observable input will not abort the request.

To facilitate aborting the retrieval of responses that use chunked transfer encoding,
a `selector` can be specified via the `init` parameter:

```ts
import { of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

const data$ = fromFetch('https://api.github.com/users?per_page=5', {
  selector: (response) => response.json(),
});

data$.subscribe({
  next: (result) => console.log(result),
  complete: () => console.log('done'),
});
```

## Parameters

### `input`

The resource you would like to fetch. Can be a url or a request object.

### `initWithSelector`

A configuration object for the fetch. [See MDN for more details](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)

## Returns

`Observable`

An Observable, that when subscribed to, performs an HTTP request using the native
function. The Subscription is tied to an for the fetch.

## Call Signature

```ts
function fromFetch<>(
  input: string | Request,
  init: RequestInit & {
    selector: (response: Response) => ObservableInput<T>;
  }
): Observable<T>;
```

Defined in: [rxjs/src/internal/observable/dom/fetch.ts:4](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/dom/fetch.ts#L4)

### Parameters

| Parameter | Type                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `input`   | `string` \| `Request`                                                                                                                 |
| `init`    | `RequestInit` & \{ `selector`: (`response`: `Response`) => [`ObservableInput`](../../rxjs/type-aliases/ObservableInput.md)\<`T`\>; \} |

### Returns

[`Observable`](../../rxjs/classes/Observable.md)\<`T`\>

## Call Signature

```ts
function fromFetch(input: string | Request, init?: RequestInit): Observable<Response>;
```

Defined in: [rxjs/src/internal/observable/dom/fetch.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/dom/fetch.ts#L11)

### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `input`   | `string` \| `Request` |
| `init?`   | `RequestInit`         |

### Returns

[`Observable`](../../rxjs/classes/Observable.md)\<`Response`\>
