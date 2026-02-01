[API](../../index.md) / [index](../index.md) / ValueFromNotification

# Type Alias: ValueFromNotification

## Description

Gets the value type from an [ObservableNotification](ObservableNotification.md), if possible.

```ts
type ValueFromNotification<> = T extends {
  kind: "N" | "E" | "C";
} ? T extends NextNotification<any> ? T extends {
  value: infer V;
} ? V : undefined : never : never;
```

Defined in: [internal/types.ts:317](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/types.ts#L317)

Gets the value type from an [ObservableNotification](ObservableNotification.md), if possible.

