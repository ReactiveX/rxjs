import { fromEvent } from 'rxjs';
import { JQueryStyleEventEmitter } from '../../src/internal/observable/fromEvent';
import { A, B } from '../helpers';

declare const eventTargetSource: EventTarget;

it('should support an event target source', () => {
  const a = fromEvent(eventTargetSource, "click"); // $ExpectType Observable<Event>
});

declare const documentSource: HTMLDocument;

it('should support a document source', () => {
  const a = fromEvent(documentSource, "click"); // $ExpectType Observable<Event>
});

interface NodeStyleSource {
  addListener: (eventName: string | symbol, handler: (...args: any[]) => void) => this;
  removeListener: (eventName: string | symbol, handler: (...args: any[]) => void) => this;
};

declare const nodeStyleSource : NodeStyleSource;

it('should support a node-style source', () => {
  const a = fromEvent(nodeStyleSource, "something"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeStyleSource, "something"); // $ExpectType Observable<B>
});

declare const nodeCompatibleSource: {
  addListener: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
};

it('should support a node-compatible source', () => {
  const a = fromEvent(nodeCompatibleSource, "something"); // $ExpectType Observable<unknown>
  const b = fromEvent<B>(nodeCompatibleSource, "something"); // $ExpectType Observable<B>
});

declare const jQueryStyleSource: JQueryStyleEventEmitter<A, B>;

it('should support a jQuery-style source', () => {
  const a = fromEvent(jQueryStyleSource, "something"); // $ExpectType Observable<B>
  const b = fromEvent<B>(jQueryStyleSource, "something"); // $ExpectType Observable<B>
});
