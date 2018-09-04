export function consoleWarn(...args: any[]): void {
  if (console.warn) {
    console.warn(...args);
  } else {
    console.log(...args);
  }
}
