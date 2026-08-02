---
layout: home

hero:
  name: 'RxJS'
  text: 'Reactive Extensions Library for JavaScript'
  image:
    src: /Rx_Logo-512-512.png
    alt: RxJS logo
  actions:
    - theme: brand
      text: Explore RxJS Next
      link: /next/
    - theme: alt
      text: API Docs
      link: /api
---

## RxJS 9 is the next generation

The `master` branch is building RxJS 9 on the web-platform Observable model. It is not an incremental RxJS 7 release. The new package family keeps platform behavior and RxJS compatibility behavior in explicit architectural layers.

- `@rxjs/observable-polyfill` supplies the platform Observable only when a conforming native implementation is unavailable.
- `rxjs` adds the RxJS contract through exported Symbols and focused subpath exports.
- `@rxjs/test` provides the current test helpers.
- `@rxjs/migrate` provides migration analysis and tooling.

[Read the RxJS Next overview →](/next/)

RxJS 7 remains the current stable release. Its existing [guides](/guide/overview) and [migration notes](/deprecations/) remain available while the RxJS 9 documentation evolves.

## Reactive Extensions Library for JavaScript

RxJS is a library for reactive programming using Observables, making asynchronous and event-based code easier to compose.

## Code of Conduct

When participating in our community, you must follow our [Code of Conduct](/code-of-conduct).
