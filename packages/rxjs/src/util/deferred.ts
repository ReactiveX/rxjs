export class Deferred<T> {
  readonly resolve: (value: T | PromiseLike<T>) => void;
  readonly reject: (reason?: any) => void;
  readonly promise: Promise<T>;

  constructor() {
    let resolver: (typeof this)['resolve'];
    let rejector: (typeof this)['reject'];

    this.promise = new Promise((res, rej) => {
      resolver = res;
      rejector = rej;
    });

    this.resolve = resolver!;
    this.reject = rejector!;
  }
}
