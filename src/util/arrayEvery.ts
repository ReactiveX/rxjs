export default function array_every(array:Array<any>, selector:Function):Boolean {
    var index = -1;
    var count = array.length;
    while(++index < count) {
        if(!selector(array[index], index, array)) {
            return false;
        }
    }
    return count > 0;
};