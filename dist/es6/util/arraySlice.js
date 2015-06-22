var isArray = Array.isArray;
export default function arraySlice(array, index = 0) {
    if (isArray(array) === false) {
        return array;
    }
    var i = -1;
    var n = Math.max(array.length - index, 0);
    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = array[i + index];
    }
    return array2;
}
;
