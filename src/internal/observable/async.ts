import { Observable } from '../Observable';
import { ObservableInput, Observer } from '../types';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { from } from './from';
import { take } from '../operators/take';

// REVIEWER: These comments are addressed to the reviewer asking for guidance.
// They must be removed before the code is approved.

// REVIEWER: I am happy to change the name of this function to something less
// "special". I've taken `async` from the popular decorator for
// promise-yielding generator functions that predated async functions. If you
// want a different name, please just prescribe one.

// REVIEWER: I've left types off a few variables, not just for convenience, but
// sometimes because I do not know how to declare the type in TypeScript.
// Please show me how to type variables that need them.

/**
 * Turns a generator function into an observable constructor.
 *
 * `async` is a decorator for generator functions that yield observables (or
 * anything that can be converted to an observable with `from`) on the way to
 * returning a final value. `async` returns a new function that creates an
 * observable instead of a generator object. That observable will yield
 * at most one value, the final return value of the generator. It will
 * subscribe to every yielded observable on the way, so that when it is
 * unsubscribed, the intermediate observable will be unsubscribed, which is
 * useful for canceling work like AJAX requests.
 *
 * ## Example
 *
 * ```javascript
 * import { ajax } from 'rxjs/ajax'
 * import { async } from 'rxjs/observable/async'
 *
 * const logIn = async(function* ({username, password}) {
 *   try {
 *     return { token: yield ajax.getJSON(...) };
 *   } catch (error) {
 *     return { error };
 *   }
 * })
 *
 * const observable = logIn() // Request not yet sent.
 * const subscription = observable.subscribe( // Request sent now.
 *   ({ value }) => console.log('token', value),
 *   ({ error }) => console.error('error', error),
 * )
 * subscription.unsubscribe() // Request canceled.
 * ```
 *
 * @param {(...args: any[]) => Iterator<Observable<any> | T>} A generator
 * function that yields intermediate observables on its way to returning
 * a final value.
 * @return {(...args: any[]) => Observable<T>}
 * @name async
 */

// REVIEWER: Is it ok to use non-single-letter type variables?
// If not, please prescribe a replacement.
export function async<T>(
  f: (...args: any[]) => Iterator<ObservableInput<any> | T>,
): (...args: any[]) => Observable<T> {
  // Return a function that constructs an Observable.
  return function<This>(this: This, ...args: any[]) {
    return Observable.create((observer: Observer<T>) => {
      const iterator = f.apply(this, args);
      return new IteratorSubscriber(observer, iterator);
    });
  };
}

// This may seem like an implementation detail, but exporting it makes it much
// easier to build a `flow` alternative for observables in MobX.
// https://medium.com/@thejohnfreeman/escaping-pipeline-hell-38d962f66d31
export class IteratorSubscriber<T> extends Subscriber<T> {
  private subscription: Subscription | null;

  public constructor(
    observer: Observer<T>,
    private iterator: Iterator<any>,
  ) {
    super(observer);
    this.step('next');
  }

  private step(key: 'next' | 'throw' | 'return', arg?: T | Error): void {
    // Unsubscribe now.
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    let result;
    try {
      result = this.iterator[key](arg);
    } catch (error) {
      this.error(error);
      return;
    }

    // `value` is either the generator's final return value of type `T`, or it
    // is a yielded value that can be converted to an observable of type
    // `Observable<any>` using `from`. Only the generator knows what type to
    // expect from the observables it yields, and it may be a different type
    // every time. The type is bound to the yield expression, not to the
    // generator itself.
    // REVIEWER: Is there a way to declare a type for `value`? How?
    const { value, done } = result;

    if (done) {
      this.next(value);
      this.complete();
      return;
    }

    // We're going to create an observable from the value and `subscribe` to
    // it. It is possible that our subscription's `next` method is called
    // before `subscribe` returns the subscription. This happens for
    // "synchronous" observables, e.g. arrays. In such cases, the `next`
    // method will have already saved a subscription for an observable later
    // in the generator's execution, and we don't want to override it with
    // our subscription. Thus, we save our subscription to a temporary
    // variable and copy it to `this.subscription` only after checking that
    // it does not already hold another subscription.
    //
    // The observables proposal adds a `start` method to the `Observer` type
    // that accepts the `Subscription` before `next`, `complete`, or `error`
    // are ever called. That will solve our problem, but the implementation is
    // not yet available in RxJS.
    //
    // Being able to cancel the subscription before it completes will let us
    // stop counting values and lose the `take` operator. It will let us
    // assume in our completion callback that no values have been sent.
    //
    // REVIEWER: I'm counting values as a defensive measure. This will affect
    // performance slightly. Please let me know if you want these defensive
    // measures removed.
    let count = 0;
    // REVIEWER: I'm using from here to build an `Observable` from an
    // `ObservableInput`. Should I use something else?
    const subscription = from(value)
      .pipe(take(1))
      .subscribe(
        (value: any) => {
          count += 1;
          if (count > 1) {
            // This means `take` failed to cancel our subscription before
            // a second value was delivered.
            // REVIEWER: Shouldn't this be unreachable? How should it be
            // handled?
            console.error('awaited observable returned too many values');
          }
          // Recurse.
          this.step('next', value);
        },
        error => this.step('throw', error),
        () => {
          if (count < 1) {
            // The observable completed without ever yielding a value to pass
            // to the generator. This stops progress.
            // REVIEWER: How should we handle this?
            console.error('awaited observable completed with no value');
          }
          // If `count > 1`, that case was already handled in the `next`
          // callback.
        },
      );
    if (!this.subscription) {
      this.subscription = subscription;
    }
  }

  public unsubscribe() {
    this.iterator = null;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    super.unsubscribe();
  }
}
