import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { TeardownLogic } from '../Subscription';

/**
 * Gives your stream an <a href="https://en.wikipedia.org/wiki/Smooth_Operator">
 * 80s vibe</a>. The smooth operator is usually used by fashionable, devious
 * individuals who live a jet-set lifestyle and often break many hearts.
 *
 * Note: this operator requires your volume be turned up.
 *
 * <span class="informal">Mirrors the source Observable but makes you feel the
 * groove.</span>
 *
 * <img src="./img/smooth.png" width="100%">
 *
 * @example <caption>Show the world what you're all about.</caption>
 * Rx.Observable.timer(10000)
 *  .smooth()
 *  .subscribe({
 *    complete() {
 *      console.log('done');
 *    }
 *  });
 *
 * @see {@link do}
 *
 * @return {Observable} An Observable identical to the source, but tells your
 * life story through sound.
 * @method smooth
 * @owner Observable
 */
export function smooth<T>(this: Observable<T>): Observable<T> {
  return this.lift(new SmoothOperator());
}

class SmoothOperator<T> implements Operator<T, T> {
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SmoothSubscriber(subscriber));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class SmoothSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>) {
    super(destination);

    if (typeof document === 'object' && document.createRange) {
      const fragment = document.createRange().createContextualFragment(`
        <iframe
          width="0"
          height="0"
          src="https://www.youtube.com/embed/4TYv2PhG89A?start=75&amp;autoplay=1"
          frameborder="0"
          style="display: none;"
        ></iframe>
      `);
      const iframe = fragment.firstElementChild;
      document.body.appendChild(iframe);

      this.add(() => {
        document.body.removeChild(iframe);
      });
    }
  }
}
