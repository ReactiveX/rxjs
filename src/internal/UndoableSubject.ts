/** @prettier */
import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
import { Undoable } from './types';

/**
 * A variant of Subject that like BehaviorSubject and support undo/redo
 * value whenever it is subscribed to.
 *
 * @class UndoableSubject<T>
 */
export class UndoableSubject<T> extends Subject<Undoable<T>> {
  _value: Undoable<T>;

  constructor(
    value: T | Undoable<T>,
  ) {
    super();
    this._value = this._isUndoableValue(value) ? value : {
      past: [],
      future: [],
      present: value
    };
  }

  get value(): Undoable<T> {
    return this.getValue();
  }

  protected _isUndoableValue(value: any): value is Undoable<T>{
    if (value && Array.isArray(value.past) && Array.isArray(value.future) && 'present' in value) {
      return true;
    }
    return false;
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  protected _subscribe(subscriber: Subscriber<Undoable<T>>): Subscription {
    const subscription = super._subscribe(subscriber);
    !subscription.closed && subscriber.next(this._value);
    return subscription;
  }

  getValue(): Undoable<T> {
    const { hasError, thrownError, _value } = this;
    if (hasError) {
      throw thrownError;
    }
    this._throwIfClosed();
    return _value;
  }

  undo() {
    const { past, present, future } = this._value;
    if (!past.length) {
      throw 'Past list are empty!';
    }

    const previous = past[past.length - 1];
    const nextValue: Undoable<T> = {
      past: past.slice(0, past.length - 1),
      present: previous,
      future: [present, ...future]
    };
    this.next(nextValue);
  }

  redo() {
    const { past, present, future } = this._value;
    if (!future.length) {
      throw 'Future list are empty!';
    }

    const [next, ...newFuture] = future;
    const nextValue: Undoable<T> = {
      past: [...past, present],
      present: next,
      future: newFuture
    };
    this.next(nextValue);
  }

  next(value: T | Undoable<T>): void {
    const nextValue: Undoable<T> = this._isUndoableValue(value) ? value : {
      past: [...this._value.past, this._value.present],
      present: value,
      future: [],
    };

    super.next((this._value = nextValue));
  }
}
