export class Deferred<T> {
  resolve: (value?: T | PromiseLike<T> | undefined) => void = null!;
  reject: (reason?: any) => void = null!;
  promise = new Promise<T>((a, b) => {
    this.resolve = a;
    this.reject = b;
  });
}
