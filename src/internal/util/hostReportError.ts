export function hostReportError(err: any) {
  setTimeout(() => { throw err; });
}
