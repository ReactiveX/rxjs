import Observable from '../Observable';
export default (subscribe) => {
    return new Observable(subscribe);
};