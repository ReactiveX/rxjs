export default function concatMapArray(arr:Array<any>, project:(item:any, index:number, arr:Array<any>)=>any):Array<any> {
  var arr2 = [];
  var idx  = -1;
  for(var i = -1, n = arr.length; ++i < n;) {
    var item = arr[i];
    var list = project(item, i, arr);
    for(var j = -1, k = list.length; ++j < k;) {
      arr2[++idx] = list[j];
    }
  }
  return arr2;
};