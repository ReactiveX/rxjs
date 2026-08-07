# Angular 22.1

Angular 22.1 declares RxJS `^6.5.3 || ^7.4.0`. Use RxJS 7 for official Angular
integration. Local RxJS 9 type checks are exploratory and must not be described
as Angular support until that peer contract changes.

## RxJS 7 ownership

Prefer `AsyncPipe` for template-only observation. For imperative effects, bind
the subscription to the injection/component lifetime with Angular's supported
RxJS interop or an explicit `DestroyRef`. Create `toSignal`/`toObservable`
bridges once for their owner; do not recreate them in a getter or template
expression.

```ts
@Component({
  template: `@if (profile$ | async; as profile) { {{ profile.name }} }`,
})
export class ProfileComponent {
  readonly profile$ = this.route.params.pipe(
    map((params) => params['id']),
    distinctUntilChanged(),
    switchMap((id) => this.repository.load(id))
  );
}
```

`switchMap` is appropriate here because a route change makes the prior
read-only result stale. Use `concatMap` for state-changing commands whose every
result must be observed. Use `exhaustMap` to lock a submit/order action.

## Exploratory RxJS 9 ownership

When explicitly evaluating RxJS 9 before official Angular compatibility, map
`DestroyRef` to an owner signal:

```ts
const controller = new AbortController();
destroyRef.onDestroy(() => controller.abort());
values.map(project).subscribe(render, { signal: controller.signal });
```

This is an adapter experiment, not a peer-compatibility claim. A
`ColdObservable` receiver may require exact `[map]` if the mapped result must
remain producer-per-subscription.

## SSR and testing

Do not create DOM/event sources in constructors that also run on the server.
Define the hydration value and error surface for `AsyncPipe` or signals. Test
destroy/remount, route overlap, server rendering without browser globals, and
whether service-scoped streams intentionally outlive components.
