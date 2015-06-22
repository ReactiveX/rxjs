/**
All credit for this helper goes to http://github.com/YuzuJS/setImmediate
*/
interface Immediate {
    setImmediate(Function: any): any;
    clearImmediate(any: any): any;
}
declare var Immediate: Immediate;
export default Immediate;
