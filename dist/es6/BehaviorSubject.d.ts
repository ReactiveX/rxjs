import Subject from './Subject';
import { IteratorResult } from './IteratorResult';
export default class BehaviorSubject extends Subject {
    value: any;
    constructor(value: any);
    next(value: any): IteratorResult<any>;
}
