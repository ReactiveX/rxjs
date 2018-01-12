import { Observable } from '../../internal/Observable';
import { generate as staticGenerate } from '../../internal/observable/generate';

Observable.generate = staticGenerate;

declare module '../../internal/Observable' {
  namespace Observable {
    export let generate: typeof staticGenerate;
  }
}
