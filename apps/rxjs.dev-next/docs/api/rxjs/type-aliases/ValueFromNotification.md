[API](../../index.md) / [rxjs](../index.md) / ValueFromNotification

# Type Alias: ValueFromNotification

> Gets the value type from an [ObservableNotification](ObservableNotification.%0A%0A#), if possible.

```ts
type ValueFromNotification<> = T extends {
  kind: 'N' | 'E' | 'C';
}
  ? T extends NextNotification<any>
    ? T extends {
        value: infer V;
      }
      ? V
      : undefined
    : never
  : never;
```

Defined in: [rxjs/src/internal/types.ts:301](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L301)

Gets the value type from an [ObservableNotification](ObservableNotification.md), if possible.
