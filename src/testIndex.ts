import * as Rx from './Rx.Core';
import * as MyRx from './Rx.My';
import * as RxExtended from './Rx.Extended';

var rx = Rx.Observable.of();
rx.filter(); //works
//rx.isEmpty(); TS will complain

var myRx = MyRx.Observable.of();
myRx.awesome(); //new operator
myRx.filter(); //works from core
//myRx.isEmpty(); TS will complain

var extended = RxExtended.Observable.of();
extended.filter();
extended.isEmpty(); //works
