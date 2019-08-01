var welcomeText = (
  ' ____           _ ____      \n' +
  '|  _ \\ __  __  | / ___|    \n' +
  '| |_) |\\ \\/ /  | \\___ \\  \n' +
  '|  _ <  >  < |_| |___) |    \n' +
  '|_| \\_\\/_/\\_\\___/|____/ \n' +
  '\nstarted experimenting with RxJS:\n' +
  '\ntype this into the console:\n' +
  '\nrxjs.interval(500).pipe(rxjs.operators.take(4)).subscribe(console.log)\n'
);
if (console.info) {
  console.info(welcomeText);
} else {
  console.log(welcomeText);
}
