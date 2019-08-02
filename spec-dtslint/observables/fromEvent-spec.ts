import { fromEvent } from 'rxjs';
import { NodeStyleEventEmitter, HasEventTargetAddRemove } from '../../src/internal/observable/fromEvent';

const hasEventTargetAddRemove: HasEventTargetAddRemove<string> = {
  addEventListener: (type, listener, options?) => { },
  removeEventListener: (type, listener, options?) => { }
};

const nodeStyleEventEmitter: NodeStyleEventEmitter = {
  addListener: (eventName, handler) => nodeStyleEventEmitter ,
  removeListener: (eventName, handler) => nodeStyleEventEmitter
};

const div: HTMLDivElement = new HTMLDivElement();

it('should infer correctly with HasEventTargetAddRemove event type', () => { 
  const a = fromEvent(hasEventTargetAddRemove, 'foo'); // $ExpectType Observable<string>
});

it('should infer correctly with NodeStyleEventEmitter event type', () => {
  const a = fromEvent(document, 'foo'); // $ExpectType Observable<Event>
});

it('should infer correctly DOM event', () => {
  const a = fromEvent(div, 'click'); // $ExpectType Observable<Event>
});
