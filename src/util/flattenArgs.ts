import concatMapArray from './concatMapArray';

var isArray = Array.isArray;

export default function flattenArgs(args:IArguments, from:number=0, to:number=0) {
    from || (from = 0);
    to   || (to   = args.length);
    if(to < 0) {
        to = args.length + (to % args.length)
    }
    var idx = from - 1;
    var arr = new Array(to - from);
    while(++idx < to) {
        arr[idx - from] = args[idx];
    }
    return concatMapArray(arr, flattenArg);
};

function flattenArg(arg:Array<any>):Array<any> {
    return isArray(arg) && concatMapArray(arg, flattenArg) || [arg];
}