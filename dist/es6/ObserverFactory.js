import Observer from './Observer';
export default class ObserverFactory {
    create(destination) {
        return new Observer(destination);
    }
}
