import { Observable, race as staticRace } from 'rxjs';

Observable.race = staticRace;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let race: typeof staticRace;
  }
}
