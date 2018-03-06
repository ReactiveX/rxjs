import { Observable, generate as staticGenerate } from 'rxjs';

Observable.generate = staticGenerate;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let generate: typeof staticGenerate;
  }
}
