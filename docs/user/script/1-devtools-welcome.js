var welcomeText = (
  ' ____           _ ____      \n'+
  '|  _ \\ __  __  | / ___|    \n'+
  '| |_) |\\ \\/ /  | \\___ \\  \n'+
  '|  _ <  >  < |_| |___) |    \n'+
  '|_| \\_\\/_/\\_\\___/|____/ \n'+
  '\nTry this code to get started experimenting with RxJS:\n'+
  '\n    var subscription = Rx.Observable.interval(500)'+
  '.take(4).subscribe(function (x) { console.log(x) });\n'
);
if (console.info) {
  console.info(welcomeText);
} else {
  console.log(welcomeText);
}
