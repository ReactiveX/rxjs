import select from './select';
import mergeAll from './mergeAll';
import Observable from '../Observable';

export default function selectMany(project:any, concurrent:number=Number.POSITIVE_INFINITY) : Observable {
    return mergeAll.call(select.call(this, project), concurrent);
}