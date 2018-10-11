import { symbolObservable } from 'rxjs/internal/util/symbolObservable';

export function lowerCaseO<T>(...args: Array<any>): any {
  const o = {
    subscribe(observer: any) {
      args.forEach(v => observer.next(v));
      observer.complete();
      return {
        unsubscribe() { }
      };
    }
  };
  o[symbolObservable] = function (this: any) {
    return this;
  };
  return o;
}
