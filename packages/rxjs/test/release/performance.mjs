import { performance } from 'node:perf_hooks';
import { readFile } from 'node:fs/promises';
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';

const budgets = JSON.parse(await readFile(new URL('./budgets.json', import.meta.url), 'utf8'));
const mapCount = 250_000;
const cancellationCount = 20_000;

const mapRates = [];
for (let sample = 0; sample < 5; sample++) mapRates.push(await measureMap(mapCount));
const cancellationRates = [];
for (let sample = 0; sample < 5; sample++) cancellationRates.push(measureCancellation(cancellationCount));

const result = {
  mapValuesPerSecond: median(mapRates),
  cancellationsPerSecond: median(cancellationRates),
};
if (result.mapValuesPerSecond < budgets.mapValuesPerSecond) {
  throw new Error(`Map throughput ${result.mapValuesPerSecond}/s is below budget ${budgets.mapValuesPerSecond}/s.`);
}
if (result.cancellationsPerSecond < budgets.cancellationsPerSecond) {
  throw new Error(`Cancellation throughput ${result.cancellationsPerSecond}/s is below budget ${budgets.cancellationsPerSecond}/s.`);
}
process.stdout.write(`${JSON.stringify(result)}\n`);

function measureMap(count) {
  return new Promise((resolve, reject) => {
    let seen = 0;
    const source = new ColdObservable((subscriber) => {
      for (let index = 0; index < count; index++) subscriber.next(index);
      subscriber.complete();
    });
    const started = performance.now();
    source[map]((value) => value + 1).subscribe({
      next: () => seen++,
      error: reject,
      complete: () => {
        if (seen !== count) return reject(new Error(`Map benchmark observed ${seen}/${count} values.`));
        resolve(Math.round((count * 1000) / (performance.now() - started)));
      },
    });
  });
}

function measureCancellation(count) {
  const source = new ColdObservable(() => undefined);
  const started = performance.now();
  for (let index = 0; index < count; index++) {
    const controller = new AbortController();
    source.subscribe(() => undefined, { signal: controller.signal });
    controller.abort();
  }
  return Math.round((count * 1000) / (performance.now() - started));
}

function median(values) {
  return [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
}
