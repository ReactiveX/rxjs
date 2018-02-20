import { Observable } from '../internal/Observable';

Observable.prototype.then = function(this: Observable<any>, resolve, reject) {
    return this.toPromise().then(resolve, reject);
};

declare module '../internal/Observable' {
  interface Observable<T> extends PromiseLike<T> {}
}
