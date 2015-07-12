import Observer from './Observer';

export default class ObserverFactory {
  create(destination:Observer) : Observer {
    return new Observer(destination);
  }
}