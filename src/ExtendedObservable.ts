// Represents current 'KitchenSink'

export default class ExtendedObservable<T> {
  isEmpty(): ExtendedObservable<any> {
    console.log('isEmpty');
    return this;
  }
}