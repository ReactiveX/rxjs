import Subscriber from '../Subscriber';

export default function toPromise<T>(PromiseCtor: PromiseConstructor = Promise): Promise<T> {
  return new PromiseCtor((resolve, reject) => {
    let value: any;
    this.subscribe(x => value = x, err => reject(err), () => resolve(value));
  });
}