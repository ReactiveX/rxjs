[API](../../index.md) / [ajax](../index.md) / AjaxTimeoutError

# Variable: AjaxTimeoutError

> Thrown when an AJAX request times out. Not to be confused with TimeoutError.

## Description

This is exported only because it is useful for checking to see if errors are an
`instanceof AjaxTimeoutError`. DO NOT use the constructor to create an instance of
this type.

```ts
AjaxTimeoutError: AjaxTimeoutErrorCtor;
```

Defined in: [internal/ajax/errors.ts:75](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/ajax/errors.ts#L75)

## See

[ajax](ajax.md)
