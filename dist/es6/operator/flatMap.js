import map from './map';
import mergeAll from './mergeAll';
export default function flatMap(project, concurrent = Number.POSITIVE_INFINITY) {
    return mergeAll.call(map.call(this, project), concurrent);
}
