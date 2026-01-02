[API](../../index.md) / [rxjs](../index.md) / queueScheduler

# Variable: queueScheduler

> Queue Scheduler
>
> <span class="informal">Put every next task on a queue, instead of executing it immediately</span>
>
> `queueScheduler` scheduler, when used with delay, behaves the same as [asyncScheduler](asyncScheduler.%0A%0A#) scheduler.

When used without delay, it schedules given task synchronously - executes it right when
it is scheduled. However when called recursively, that is when inside the scheduled task,
another task is scheduled with queue scheduler, instead of executing immediately as well,
that task will be put on a queue and wait for current one to finish.

This means that when you execute task with `queueScheduler` scheduler, you are sure it will end
before any other task scheduled with that scheduler will start.

```ts
const queueScheduler: QueueScheduler;
```

Defined in: [rxjs/src/internal/scheduler/queue.ts:67](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/scheduler/queue.ts#L67)

Queue Scheduler

<span class="informal">Put every next task on a queue, instead of executing it immediately</span>

`queueScheduler` scheduler, when used with delay, behaves the same as [asyncScheduler](asyncScheduler.md) scheduler.

When used without delay, it schedules given task synchronously - executes it right when
it is scheduled. However when called recursively, that is when inside the scheduled task,
another task is scheduled with queue scheduler, instead of executing immediately as well,
that task will be put on a queue and wait for current one to finish.

This means that when you execute task with `queueScheduler` scheduler, you are sure it will end
before any other task scheduled with that scheduler will start.

## Example

Schedule recursively first, then do something

```ts
import { queueScheduler } from 'rxjs';

queueScheduler.schedule(() => {
  queueScheduler.schedule(() => console.log('second')); // will not happen now, but will be put on a queue

  console.log('first');
});

// Logs:
// "first"
// "second"
```

Reschedule itself recursively

```ts
import { queueScheduler } from 'rxjs';

queueScheduler.schedule(
  function (state) {
    if (state !== 0) {
      console.log('before', state);
      this.schedule(state - 1); // `this` references currently executing Action,
      // which we reschedule with new state
      console.log('after', state);
    }
  },
  0,
  3
);

// In scheduler that runs recursively, you would expect:
// "before", 3
// "before", 2
// "before", 1
// "after", 1
// "after", 2
// "after", 3

// But with queue it logs:
// "before", 3
// "after", 3
// "before", 2
// "after", 2
// "before", 1
// "after", 1
```
