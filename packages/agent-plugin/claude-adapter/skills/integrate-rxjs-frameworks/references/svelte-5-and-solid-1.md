# Svelte 5.56 and SolidJS 1.9

## Svelte 5.56

Create browser-backed sources during client lifecycle and abort/unsubscribe in
`onDestroy`. Keep stream creation out of reactive expressions that rerun unless
the old observation is explicitly cleaned up. Map values into component state;
do not assume a Svelte store adapter owns an RxJS resource unless its
start/stop contract actually does.

## SolidJS 1.9

Create the observation inside the owning reactive root and register
`onCleanup`. Write notifications into a signal with the functional setter form
when values themselves can be functions. Avoid creating a new Observable on
every tracked read; use `untrack` or a stable owner where appropriate.

## Both

RxJS 9 uses an owner `AbortController`; RxJS 7 uses the returned
`Subscription`. Delay DOM/EventTarget sources until the client, define the SSR
initial value, and test cleanup/remount. Integrate class controllers and
readonly tuple factories through their public capabilities rather than
reaching into a Subject.
