import {Observable} from 'rxjs';
import 'rxjs/add/observable/range';
import 'rxjs/add/operator/map';

Observable
  .range(1, 3)
  .map(x => x * 2)
  .subscribe(console.log.bind(console));