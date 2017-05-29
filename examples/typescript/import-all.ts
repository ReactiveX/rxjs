import * as Rx from 'rxjs';

Rx.Observable
  .range(1, 3)
  .map(x => x * 2)
  .subscribe(console.log.bind(console));