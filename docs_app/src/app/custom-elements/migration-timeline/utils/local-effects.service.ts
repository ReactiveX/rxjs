import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, Observable, Subject, Subscription} from 'rxjs';
import {mergeAll, publishReplay} from 'rxjs/operators';

@Injectable()
export class LocalEffects implements OnDestroy {
    private subscription = new Subscription();
    private effectSubject = new Subject<Observable<{ [key: string]: number }>>();
    constructor() {
        this.subscription.add((this.effectSubject
            .pipe(mergeAll(), publishReplay(1)
            ) as ConnectableObservable<any>).connect()
        );
    }
    connectEffect(o: Observable<any>): void {
        this.effectSubject.next(o);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
