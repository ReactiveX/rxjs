import select from './select';
import mergeAll from './mergeAll';
import OperatorObservable from '../OperatorObservable';

export default function selectMany(project:any, concurrent:number=Number.POSITIVE_INFINITY) : OperatorObservable {
    return mergeAll.call(select.call(this, project), concurrent);
}