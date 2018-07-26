import { WebSocketSubject, WebSocketSubjectConfig } from './WebSocketSubject';

/**
 * Wrapper around the w3c-compatible WebSocket object provided by the browser.
 *
 * <span class="informal">{@link Subject} that communicates with a server via WebSocket</span>
 *
 * `webSocket` is a factory function that produces a `WebSocketSubject`,
 * which can be used to make WebSocket connection with an arbitrary endpoint.
 * `webSocket` accepts as an argument either a string with url of WebSocket endpoint, or an
 * {@link WebSocketSubjectConfig} object, where you can provide additional configuration, as
 * well as Observers for tracking lifecycle of WebSocket connection.
 *
 * When `WebSocketSubject` is subscribed, it attempts to make a socket connection,
 * unless there is one made already. This means that many subscribers will always listen
 * on the same socket, thus saving your resources. If however you make two instances of `WebSocketSubject`,
 * even if these two were provided with the same url, they will attempt to make separate
 * connections. When consumer of a `WebSocketSubject` unsubscribes, socket connection is closed,
 * but only if there is no more subscribers still listening. If after some time someone starts
 * subscribing again, connection is reestablished.
 *
 * Once connection is made, whenever new message comes from the server, `WebSocketSubject` will emit that
 * message as a value in the stream. By default message from the socket is parsed via `JSON.parse`. If you
 * want to customize how deserialization is handled (if at all), you can provide custom `resultSelector`
 * function in {@link WebSocketSubject}. When connection closes, stream will complete, provided it happened without
 * any errors. If at any point (starting, maintaining or closing a connection) there is an error,
 * stream will also error with whatever WebSocket API have thrown.
 *
 * By virtue of being a {@link Subject}, `WebSocketSubject` allows not only to receive messages, but to send them
 * to the server as well. In order to communicate with a connected endpoint, you can use `next`, `error`
 * and `complete` methods. `next` sends a value to the server, but bear in mind that this value will not be serialized
 * beforehand. This means you will have to call `JSON.stringify` on a value by hand, before calling `next` with a result.
 * Note also that if at the moment of nexting value
 * there is no socket connection (for example no one is subscribing), those values will be buffered, and sent when connection
 * is finally established. `complete` method closes socket connection. `error` does so as well,
 * but also notifies server that something went wrong via status code and string with details of what happened.
 * Since status code is required in WebSocket API, `WebSocketSubject` does not allow, like regular Subject,
 * arbitrary values being passed to the `error` method. It needs to be called with an object that has `code`
 * property with status code number and optional `reason` property with string describing details
 * of an error.
 *
 * Calling `next` does not affect subscribers of `WebSocketSubject` - they have no
 * information that something was sent to the server (unless of course the server
 * responds somehow to a message). On the other hand, since calling `complete` triggers
 * an attempt to close socket connection, if that connection is closed without any errors, stream will
 * complete, thus notifying all subscribers. And since calling `error` closes
 * socket connection as well, just with a different status code for the server, if closing itself proceeds
 * without errors, subscribed Observable will not error, as you might expect, but complete as usual. In both cases
 * (calling `complete` or `error`), if process of closing socket connection results in some errors, *then* stream
 * will error.
 *
 * **Multiplexing**
 *
 * `WebSocketSubject` has additional operator, not found in other Subjects. It is called `multiplex` and it is
 * used to simulate opening several socket connections, while in reality maintaining only one.
 * Let's say that your application has both chat panel
 * and real-time notifications about sport news. Since these are two distinct functions, it would make sense
 * to have two separate connections for each. Perhaps you would even have two separate services with WebSocket
 * endpoints, running on separate machines with only GUI combining them together. But having a socket connection
 * for each functionality could become too resource expensive, so it is a common pattern to have single
 * WebSocket endpoint that acts as a gateway for the other services (in our case chat and sport news services).
 * But even though we have single connection in a client app, we want to manipulate streams as if it
 * were two separate sockets, so that we do not have to manually register and unregister in a gateway for
 * given service and filter out messages that we are actually interested in. And that is exactly what
 * `multiplex` method is for.
 *
 * Method accepts three parameters. First two are functions returning subscription and unsubscription messages
 * respectively. These are messages that will be sent to the server, whenever consumer of resulting Observable
 * subscribes and unsubscribes. Server can use them to verify that some kind of messages should start or stop
 * being forwarded to the client. In case of our application, after getting subscription message with proper identifier,
 * gateway server can decide that it should connect to real sport news service and start forwarding messages from it.
 * Note that both messages will be sent as returned by the functions, so you have to serialize them yourself, just
 * as messages pushed via `next`. Also bear in mind that these messages will be sent on *every* subscription and
 * unsubscription. This is potentially dangerous, because one consumer of an Observable may unsubscribe and the server
 * might stop sending messages, since it got unsubscription message. You need to either handle this case
 * on the server or use {@link publish} on a Observable returned from 'multiplex'.
 *
 * Last argument to `multiplex` is a `messageFilter` function which filters out messages
 * sent by the server to only those that belong to simulated WebSocket stream. For example server might mark these
 * messages with some kind of string identifier on a message object and `messageFilter` would return `true`
 * if there is such identifier on an object emitted by the socket.
 *
 * Return value of `multiplex` is an Observable with messages incoming from emulated socket connection. Note that this
 * is not a `WebSocketSubject`, so calling `next` or `multiplex` again will fail. For pushing values to the
 * server you still need to use root `WebSocketSubject`.
 *
 *
 * @example <caption>Listening for messages from the server.</caption>
 * const subject = Rx.Observable.webSocket('ws://localhost:8081');
 *
 * subject.subscribe(
 *    (msg) => console.log('message received: ' + msg), // Called whenever there is a message from the server.
 *    (err) => console.log(err), // Called if at any point WebSocket API signals some kind of error.
 *    () => console.log('complete') // Called when connection is closed (for whatever reason).
 *  );
 *
 *
 * @example <caption>Pushing messages to the server.</caption>
 * const subject = Rx.Observable.webSocket('ws://localhost:8081');
 *
 * subject.subscribe(); // Note that at least one consumer has to subscribe to
 *                      // the created subject - otherwise "nexted" values will be just
 *                      // buffered and not sent, since no connection was established!
 *
 * subject.next(JSON.stringify({message: 'some message'})); // This will send a message to the server
 *                                                          // once a connection is made.
 *                                                          // Remember to serialize sent value first!
 *
 * subject.complete(); // Closes the connection.
 *
 *
 * subject.error({code: 4000, reason: 'I think our app just broke!'}); // Also closes the connection,
 *                                                                     // but let's the server know that
 *                                                                     // this closing is caused by some error.
 *
 *
 * @example <caption>Multiplexing WebSocket</caption>
 * const subject = Rx.Observable.webSocket('ws://localhost:8081');
 *
 * const observableA = subject.multiplex(
 *   () => JSON.stringify({subscribe: 'A'}), // When server gets this message, it will start sending messages for 'A'...
 *   () => JSON.stringify({unsubscribe: 'A'}), // ...and when gets this one, it will stop.
 *   message => message.type === 'A' // Server will tag all messages for 'A' with type property.
 * );
 *
 * const observableB = subject.multiplex( // And the same goes for 'B'.
 *   () => JSON.stringify({subscribe: 'B'}),
 *   () => JSON.stringify({unsubscribe: 'B'}),
 *   message => message.type === 'B'
 * );
 *
 * const subA = observableA.subscribe(messageForA => console.log(messageForA));
 * // At this moment WebSocket connection
 * // is established. Server gets '{"subscribe": "A"}'
 * // message and starts sending messages for 'A',
 * // which we log here.
 *
 * const subB = observableB.subscribe(messageForB => console.log(messageForB));
 * // Since we already have a connection,
 * // we just send '{"subscribe": "B"}' message
 * // to the server. It starts sending
 * // messages for 'B', which we log here.
 *
 * subB.unsubscribe();
 * // Message '{"unsubscribe": "B"}' is sent to the
 * // server, which stops sending 'B' messages.
 *
 * subA.unubscribe();
 * // Message '{"unsubscribe": "A"}' makes the server
 * // stop sending messages for 'A'. Since there is
 * // no more subscribers to root Subject, socket
 * // connection closes.
 *
 *
 *
 * @param {string|WebSocketSubjectConfig} urlConfigOrSource The WebSocket endpoint as an url or an object with
 * configuration and additional Observers.
 * @return {WebSocketSubject} Subject which allows to both send and receive messages via WebSocket connection.
 */
export function webSocket<T>(urlConfigOrSource: string | WebSocketSubjectConfig<T>): WebSocketSubject<T> {
  return new WebSocketSubject<T>(urlConfigOrSource);
}
