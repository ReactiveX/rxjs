export function isScheduler(value: any): boolean {
  return value && typeof value.schedule === 'function';
}