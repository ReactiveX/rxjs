import CoreObservable from './CoreObservable';
import {applyMixins} from './CoreObservable';
import ExtendedObservable from './ExtendedObservable';

//'KitchenSink' includes Core operator with additional 'isEmpty'
class Observable<T> implements CoreObservable<T>, ExtendedObservable<T> {
  filter: () => Observable<any>;
  isEmpty: () => Observable<any>;

  static of: () => Observable<any>;
}

applyMixins(Observable, [CoreObservable, ExtendedObservable])

export {
  Observable
};