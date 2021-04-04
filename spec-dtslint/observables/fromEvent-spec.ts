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

declare const documentSource: HTMLDocument;

it('should support a document source', () => {
  const source: HasEventTargetAddRemove<Event> = documentSource;
  const a = fromEvent(documentSource, "click"); // $ExpectType Observable<Event>
});

// Pick the parts that will match NodeStyleEventEmitter. If this isn't done, it
// will match JQueryStyleEventEmitter - because of the `on` and `off` methods -
// despite the latter being declared last in the EventTargetLike union.
declare const nodeStyleSource: Pick<typeof process, 'addListener' | 'removeListener'>;

it('should support a node-style source', () => {
  const source: NodeStyleEventEmitter = nodeStyleSource;
  const a = fromEvent(nodeStyleSource, "something"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeStyleSource, "something"); // $ExpectType Observable<B>
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

const jQueryStyleSource = {
  on(eventName: "something", handler: (this: any, b: B) => any) {},
  off(eventName: "something", handler: (this: any, b: B) => any) {}
};

it('should support a jQuery-style source', () => {
  const source: JQueryStyleEventEmitter<any, any> = jQueryStyleSource;
  const a = fromEvent(jQueryStyleSource, "something"); // $ExpectType Observable<B>
  const b = fromEvent<B>(jQueryStyleSource, "something"); // $ExpectType Observable<B>
});
