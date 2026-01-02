[API](../../index.md) / [webSocket](../index.md) / WebSocketSubjectConfig

# Interface: WebSocketSubjectConfig

> WebSocketSubjectConfig is a plain Object that allows us to make our
> webSocket configurable.

## Description

<span class="informal">Provides flexibility to [webSocket](../functions/webSocket.md)</span>

It defines a set of properties to provide custom behavior in specific
moments of the socket's lifecycle. When the connection opens we can
use `openObserver`, when the connection is closed `closeObserver`, if we
are interested in listening for data coming from server: `deserializer`,
which allows us to customize the deserialization strategy of data before passing it
to the socket client. By default, `deserializer` is going to apply `JSON.parse` to each message coming
from the Server.

Defined in: [rxjs/src/internal/observable/dom/WebSocketSubject.ts:102](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/dom/WebSocketSubject.ts#L102)

WebSocketSubjectConfig is a plain Object that allows us to make our
webSocket configurable.

<span class="informal">Provides flexibility to [webSocket](../functions/webSocket.md)</span>

It defines a set of properties to provide custom behavior in specific
moments of the socket's lifecycle. When the connection opens we can
use `openObserver`, when the connection is closed `closeObserver`, if we
are interested in listening for data coming from server: `deserializer`,
which allows us to customize the deserialization strategy of data before passing it
to the socket client. By default, `deserializer` is going to apply `JSON.parse` to each message coming
from the Server.

## Example

**deserializer**, the default for this property is `JSON.parse` but since there are just two options
for incoming data, either be text or binary data. We can apply a custom deserialization strategy
or just simply skip the default behaviour.

```ts
import { webSocket } from 'rxjs/webSocket';

const wsSubject = webSocket({
  url: 'ws://localhost:8081',
  //Apply any transformation of your choice.
  deserializer: ({ data }) => data,
});

wsSubject.subscribe(console.log);

// Let's suppose we have this on the Server: ws.send('This is a msg from the server')
//output
//
// This is a msg from the server
```

**serializer** allows us to apply custom serialization strategy but for the outgoing messages.

```ts
import { webSocket } from 'rxjs/webSocket';

const wsSubject = webSocket({
  url: 'ws://localhost:8081',
  // Apply any transformation of your choice.
  serializer: (msg) => JSON.stringify({ channel: 'webDevelopment', msg: msg }),
});

wsSubject.subscribe(() => subject.next('msg to the server'));

// Let's suppose we have this on the Server:
//   ws.on('message', msg => console.log);
//   ws.send('This is a msg from the server');
// output at server side:
//
// {"channel":"webDevelopment","msg":"msg to the server"}
```

**closeObserver** allows us to set a custom error when an error raises up.

```ts
import { webSocket } from 'rxjs/webSocket';

const wsSubject = webSocket({
  url: 'ws://localhost:8081',
  closeObserver: {
    next() {
      const customError = { code: 6666, reason: 'Custom evil reason' };
      console.log(`code: ${customError.code}, reason: ${customError.reason}`);
    },
  },
});

// output
// code: 6666, reason: Custom evil reason
```

**openObserver**, Let's say we need to make some kind of init task before sending/receiving msgs to the
webSocket or sending notification that the connection was successful, this is when
openObserver is useful for.

```ts
import { webSocket } from 'rxjs/webSocket';

const wsSubject = webSocket({
  url: 'ws://localhost:8081',
  openObserver: {
    next: () => {
      console.log('Connection ok');
    },
  },
});

// output
// Connection ok
```

## Properties

| Property                                          | Type                                                                    | Description                                                                                                                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="binarytype"></a> `binaryType?`             | `"arraybuffer"` \| `"blob"`                                             | Sets the `binaryType` property of the underlying WebSocket.                                                                                                                 |
| <a id="closeobserver"></a> `closeObserver?`       | [`NextObserver`](../../rxjs/interfaces/NextObserver.md)\<`CloseEvent`\> | An Observer that watches when close events occur on the underlying web socket                                                                                               |
| <a id="closingobserver"></a> `closingObserver?`   | [`NextObserver`](../../rxjs/interfaces/NextObserver.md)\<`void`\>       | An Observer that watches when a close is about to occur due to unsubscription.                                                                                              |
| <a id="deserializer"></a> `deserializer?`         | (`e`: `MessageEvent`) => `Out`                                          | A deserializer used for messages arriving on the socket from the server. Defaults to JSON.parse.                                                                            |
| <a id="openobserver"></a> `openObserver?`         | [`NextObserver`](../../rxjs/interfaces/NextObserver.md)\<`Event`\>      | An Observer that watches when open events occur on the underlying web socket.                                                                                               |
| <a id="protocol"></a> `protocol?`                 | `string` \| `string`[]                                                  | The protocol to use to connect                                                                                                                                              |
| <a id="resultselector"></a> ~~`resultSelector?`~~ | (`e`: `MessageEvent`) => `Out`                                          | **Deprecated** Will be removed in v8. Use [deserializer](#deserializer) instead.                                                                                            |
| <a id="serializer"></a> `serializer?`             | (`value`: `In`) => `WebSocketMessage`                                   | A serializer used to create messages from passed values before the messages are sent to the server. Defaults to JSON.stringify.                                             |
| <a id="url"></a> `url`                            | `string`                                                                | The url of the socket server to connect to                                                                                                                                  |
| <a id="websocketctor"></a> `WebSocketCtor?`       | (`url`: `string`, `protocols?`: `string` \| `string`[]) => `WebSocket`  | A WebSocket constructor to use. This is useful for situations like using a WebSocket impl in Node (WebSocket is a DOM API), or for mocking a WebSocket for testing purposes |
