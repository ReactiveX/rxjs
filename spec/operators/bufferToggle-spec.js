/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferToggle', function () {
  it('should emit buffers that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument', function () {
    var e1 =   hot('-----a----b----c----d----e----f----g----h----i----|')
    var e2 =  cold('-------------x-------------y--------------z-------|');
    var e3 =               cold('---------------(j|)');
    //                                         ---------------|
    //                                                        --------|
    var expected = '----------------------------q-------------r-------(s|)';
    
    var values = {
      q: ['c','d','e'],
      r: ['f','g','h'],
      s: ['i']
    };
    var innerVals = ['x', 'y', 'z'];
    
    expectObservable(e1.bufferToggle(e2, function(x) {
      expect(x).toBe(innerVals.shift());
      return e3;
    })).toBe(expected, values);
  });
});