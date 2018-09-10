var welcomeText = (
  ' ____           _ ____      \n' +
  '|  _ \\ __  __  | / ___|    \n' +
  '| |_) |\\ \\/ /  | \\___ \\  \n' +
  '|  _ <  >  < |_| |___) |    \n' +
  '|_| \\_\\/_/\\_\\___/|____/ \n' +
  '\nOpen http://stackblitz.com and try this code to get\n' +
  '\nstarted experimenting with RxJS:\n' +
  '\nimport { interval } from "rxjs"\n' +
  '\nimport { take } from "rxjs/operators"\n' +
  '\nconst subscription = interval(500).pipe(take(4)).subscribe(console.log)\n'
);
if (console.info) {
  console.info(welcomeText);
} else {
  console.log(welcomeText);
}
