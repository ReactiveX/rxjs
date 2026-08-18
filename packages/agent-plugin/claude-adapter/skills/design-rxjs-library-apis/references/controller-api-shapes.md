# Controller API shapes

Keep mutable event ingress private and expose only the commands and Observable
views callers need.

## Class controller

```ts
class SearchController {
  readonly #queries = new Subject<string>();
  readonly results = this.#queries.pipe(switchMap((query) => this.api.search(query)));

  constructor(private readonly api: SearchApi) {}

  setQuery(query: string): void {
    this.#queries.next(query);
  }
}
```

A class supplies object identity, inheritance when appropriate, and shared
prototype method implementations. That may reduce per-instance function
allocation in some runtimes.

## Readonly tuple factory

```ts
function createSearch(api: SearchApi) {
  const queries = new Subject<string>();
  const results = queries.pipe(switchMap((query) => api.search(query)));
  const setQuery = (query: string) => queries.next(query);

  return [setQuery, results] as const;
}
```

The tuple is compact, destructurable, and composition-friendly. It allocates
command closures per factory call. Treat class versus factory as an API and
measured-runtime decision, not a quality hierarchy.

For RxJS 9, use the same shapes with platform-first composition—for example,
`queries.switchMap(...)` for this stale-read search policy. Use `.flatMap()` as
the default for work whose every result matters. Do not expose the Subject
merely to avoid designing commands.
