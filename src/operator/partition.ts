import Observable from '../Observable';

export default function partition(predicate: (x: any, i?:any, a?:any) => boolean, thisArg?:any): Observable[] {
    return [
        this.filter(predicate),
        this.filter((x, i, a) => !predicate.call(thisArg, x, i, a))
    ];
}