[API](../../index.md) / [rxjs](../index.md) / ConnectConfig

# Interface: ConnectConfig

> An object used to configure [connect](.

## Description

./functions/connect.md) operator.

Defined in: [rxjs/src/internal/operators/connect.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/connect.ts#L9)

An object used to configure [connect](../functions/connect.md) operator.

## Properties

| Property                           | Type                                         | Description                                                                                                                                       |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="connector"></a> `connector` | () => [`SubjectLike`](SubjectLike.md)\<`T`\> | A factory function used to create the Subject through which the source is multicast. By default, this creates a [Subject](../classes/Subject.md). |
