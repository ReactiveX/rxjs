# RxJS 9 marbles and assertions

`@rxjs/test` uses virtual milliseconds. Numeric durations such as `12ms`,
grouped notifications, errors, completion, and subscription diagrams are
supported.

```ts
import 'rxjs';
import { rxTest } from '@rxjs/test';

await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
  const sourceMarbles = '       12ms a 20ms (b|)';
  const expectedMarbles = '     12ms x 20ms (y|)';
  const sourceSubscriptions = ' ^ 32ms !';
  const source = observable(sourceMarbles, { a: 1, b: 2 });

  expectObservable(source.map((value) => value * 10)).toBe(expectedMarbles, { x: 10, y: 20 });
  expectSubscriptions(source.subscriptions).toBe(sourceSubscriptions);
});
```

## Available comparisons

- `expectObservable(actual).toBe(marbles, values, error)` compares notifications.
- `.toBe(messages)` compares exact timestamped message records.
- `.toEqual(expectedObservable)` records both through the same window.
- `expectSubscriptions(logs).toBe(diagramOrDiagrams)` compares lifetime logs.
- `time('---|')` returns the timestamp of the single completion marker.

## Observation windows

Pass subscription marbles to `expectObservable(actual, '^---!')`. The
unsubscription frame is exclusive: a notification at that same frame is not
accepted. Use this to prove early cancellation and final-observer close.

## Custom equality

`rxTest` has a framework-independent default deep assertion. Supply
`assertDeepEqual` in config when integrating with a test framework, and use the
provided assertion metadata to distinguish observable and subscription
failures.

## Make diagrams readable

Whitespace in marble strings is ignored, specifically so diagrams can be
placed in visual columns in a fixed-width editor. Assign each role a named
constant and align the timeline portion vertically: source, inner sources,
observation windows, expected output, and subscription windows. Use domain
value maps, keep one behavior per case, and assert subscription logs whenever
delivery alone cannot prove the claim.
