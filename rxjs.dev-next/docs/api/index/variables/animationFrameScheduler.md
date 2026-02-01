[API](../../index.md) / [index](../index.md) / animationFrameScheduler

# Variable: animationFrameScheduler

> Animation Frame Scheduler

## Description

<span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>

When `animationFrame` scheduler is used with delay, it will fall back to [asyncScheduler](asyncScheduler.md) scheduler
behaviour.

Without delay, `animationFrame` scheduler can be used to create smooth browser animations.
It makes sure scheduled task will happen just before next browser content repaint,
thus performing animations as efficiently as possible.

## Example
Schedule div height animation
```ts
// html: <div style="background: #0ff;"></div>
import { animationFrameScheduler } from 'rxjs';

const div = document.querySelector('div');

animationFrameScheduler.schedule(function(height) {
  div.style.height = height + "px";

  this.schedule(height + 1);  // `this` references currently executing Action,
                              // which we reschedule with new state
}, 0, 0);

// You will see a div element growing in height
```

```ts
const animationFrameScheduler: AnimationFrameScheduler;
```

Defined in: [internal/scheduler/animationFrame.ts:36](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/scheduler/animationFrame.ts#L36)
