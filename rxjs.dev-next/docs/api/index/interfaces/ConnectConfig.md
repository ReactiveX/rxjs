[API](../../index.md) / [index](../index.md) / ConnectConfig

# Interface: ConnectConfig

## Description

An object used to configure [connect](../functions/connect.md) operator.

Defined in: [internal/operators/connect.ts:11](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/connect.ts#L11)

An object used to configure [connect](../functions/connect.md) operator.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="connector"></a> `connector` | () => [`SubjectLike`](SubjectLike.md)\<`T`\> | A factory function used to create the Subject through which the source is multicast. By default, this creates a [Subject](../classes/Subject.md). |
