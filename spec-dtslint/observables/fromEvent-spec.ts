import { fromEvent } from 'rxjs';
import {
  HasEventTargetAddRemove,
  NodeStyleEventEmitter,
  NodeCompatibleEventEmitter,
  JQueryStyleEventEmitter
} from '../../src/internal/observable/fromEvent';
import { B } from '../helpers';

declare const eventTargetSource: EventTarget;

it('should support an event target source', () => {
  const source: HasEventTargetAddRemove<Event> = eventTargetSource;
  const a = fromEvent(eventTargetSource, "click"); // $ExpectType Observable<Event>
});

it('should support an event target source result selector', () => {
  const a = fromEvent(eventTargetSource, "click", () => "clunk"); // $ExpectType Observable<string>
});

it('should support an event target source with options', () => {
    const a = fromEvent(eventTargetSource, "click", { once: true }); // $ExpectType Observable<Event>
});

it('should support an event target source with options and result selector', () => {
    const a = fromEvent(eventTargetSource, "click", { once: true }, () => "clunk"); // $ExpectType Observable<string>
});

declare const documentSource: HTMLDocument;

it('should support a document source', () => {
  const source: HasEventTargetAddRemove<Event> = documentSource;
  const a = fromEvent(documentSource, "click"); // $ExpectType Observable<Event>
});

it('should support a document source result selector', () => {
  const a = fromEvent(documentSource, "click", () => "clunk"); // $ExpectType Observable<string>
});

it('should support a document source with options', () => {
    const a = fromEvent(documentSource, "click", { once: true }); // $ExpectType Observable<Event>
});

it('should support a document source with options and result selector', () => {
    const a = fromEvent(documentSource, "click", { once: true }, () => "clunk"); // $ExpectType Observable<string>
});

// Pick the parts that will match NodeStyleEventEmitter. If this isn't done, it
// will match JQueryStyleEventEmitter - because of the `on` and `off` methods -
// despite the latter being declared last in the EventTargetLike union.
declare const nodeStyleSource: Pick<typeof process, 'addListener' | 'removeListener'>;

it('should support a node-style source', () => {
  const source: NodeStyleEventEmitter = nodeStyleSource;
  const a = fromEvent(nodeStyleSource, "exit"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeStyleSource, "exit"); // $ExpectType Observable<B>
});

it('should deprecate explicit type parameters for a node-style source', () => {
  const source: NodeStyleEventEmitter = nodeStyleSource;
  const a = fromEvent(nodeStyleSource, "exit"); // $ExpectNoDeprecation
  const b = fromEvent<B>(nodeStyleSource, "exit"); // $ExpectDeprecation
});

it('should support a node-style source result selector', () => {
  const a = fromEvent(nodeStyleSource, "exit", () => "bye"); // $ExpectType Observable<string>
});

const nodeCompatibleSource = {
  addListener(eventName: "something", handler: () => void) {},
  removeListener(eventName: "something", handler: () => void) {}
};

it('should support a node-compatible source', () => {
  const source: NodeCompatibleEventEmitter = nodeCompatibleSource;
  const a = fromEvent(nodeCompatibleSource, "something"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeCompatibleSource, "something"); // $ExpectType Observable<B>
});

it('should deprecate explicit type parameters for a node-compatible source', () => {
  const source: NodeCompatibleEventEmitter = nodeCompatibleSource;
  const a = fromEvent(nodeCompatibleSource, "something"); // $ExpectNoDeprecation
  const b = fromEvent<B>(nodeCompatibleSource, "something"); // $ExpectDeprecation
});

it('should support a node-compatible source result selector', () => {
  const a = fromEvent(nodeCompatibleSource, "something", () => "something else"); // $ExpectType Observable<string>
});

const jQueryStyleSource = {
  on(eventName: "something", handler: (this: any, b: B) => any) {},
  off(eventName: "something", handler: (this: any, b: B) => any) {}
};

it('should support a jQuery-style source', () => {
  const source: JQueryStyleEventEmitter<any, any> = jQueryStyleSource;
  const a = fromEvent(jQueryStyleSource, "something"); // $ExpectType Observable<B>
  const b = fromEvent<B>(jQueryStyleSource, "something"); // $ExpectType Observable<B>
});

it('should support a jQuery-style source result selector', () => {
  const a = fromEvent(jQueryStyleSource, "something", () => "something else"); // $ExpectType Observable<string>
});

/**
 * Huan(202111): Correct typing inference for Node.js EventEmitter as `number`
 *  @see https://github.com/ReactiveX/rxjs/pull/6669
 */
it('should successful inference the first argument from the listener of Node.js EventEmitter', (done) => {
  class NodeEventeEmitterTest {
    addListener(eventName: 'foo', listener: (foo: false) => void): this
    addListener(eventName: 'bar', listener: (bar: boolean) => void): this
    addListener(eventName: 'foo' | 'bar', listener: ((foo: false) => void) | ((bar: boolean) => void)): this  { return this; }

    removeListener(eventName: 'foo', listener: (foo: false) => void ): this
    removeListener(eventName: 'bar', listener: (bar: boolean) => void ): this
    removeListener(eventName: 'foo' | 'bar', listener: ((foo: false) => void) | ((bar: boolean) => void)): this  { return this; }
  }

  const test = new NodeEventeEmitterTest();

  const foo$ = fromEvent(test, 'foo');  // $ExpectType Observable<false>
  const bar$ = fromEvent(test, 'bar');  // $ExpectType Observable<boolean>
});
