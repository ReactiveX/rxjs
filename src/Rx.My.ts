import CoreObservable from './CoreObservable';
import {applyMixins} from './CoreObservable';

//Creating new module based on flavor, adding custom operator
export class CustomObservable<T> {
  awesome(): CustomObservable<T>{
    return this;
  }
}

export class MyObservable<T> implements CoreObservable<T>, CustomObservable<T> {
  filter: () => MyObservable<any>;
  awesome: () => MyObservable<any>;

  static of: () => MyObservable<any>;
}

applyMixins(MyObservable, [CoreObservable, CustomObservable])

export {
  MyObservable as Observable
};