[API](../../index.md) / [rxjs](../index.md) / animationFrameScheduler

# Variable: animationFrameScheduler

> Animation Frame Scheduler
>
> <span class="informal">Perform task when `window.

## Description

requestAnimationFrame` would fire</span>

When `animationFrameScheduler` scheduler is used with delay, it will fall back to [asyncScheduler](asyncScheduler.md)
scheduler behaviour.

Without delay, `animationFrameScheduler` scheduler can be used to create smooth browser animations.
It makes sure scheduled task will happen just before next browser content repaint,
thus performing animations as efficiently as possible.

```ts
const animationFrameScheduler: AnimationFrameScheduler;
```

Defined in: [rxjs/src/internal/scheduler/animationFrame.ts:36](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/scheduler/animationFrame.ts#L36)

Animation Frame Scheduler

<span class="informal">Perform task when `window.requestAnimationFrame` would fire</span>

When `animationFrameScheduler` scheduler is used with delay, it will fall back to [asyncScheduler](asyncScheduler.md)
scheduler behaviour.

Without delay, `animationFrameScheduler` scheduler can be used to create smooth browser animations.
It makes sure scheduled task will happen just before next browser content repaint,
thus performing animations as efficiently as possible.

## Example

Schedule div height animation

```ts
// html: <div style="background: #0ff;"></div>
import { animationFrameScheduler } from 'rxjs';

const div = document.querySelector('div');

animationFrameScheduler.schedule(
  function (height) {
    div.style.height = height + 'px';

    this.schedule(height + 1); // `this` references currently executing Action,
    // which we reschedule with new state
  },
  0,
  0
);

// You will see a div element growing in height
```
