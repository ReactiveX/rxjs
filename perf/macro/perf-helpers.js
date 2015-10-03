define('perf-helpers', ['exports'], function (exports) {
  exports.printLn = function () {
    var args = [].slice.call(arguments);
    var p = document.createElement('p');
    p.innerText = args.map(function (x) {
      if (typeof x === 'object') {
        return JSON.stringify(x, null, 2);
      }
      return x.toString();
    }).join(' ');

    document.body.appendChild(p);
    window.console.log.apply(window.console, args);
  };
});