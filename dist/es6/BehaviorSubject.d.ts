import Subject from './Subject';
export default class BehaviorSubject extends Subject {
    value: any;
    constructor(value: any);
    next(value: any): void;
}
