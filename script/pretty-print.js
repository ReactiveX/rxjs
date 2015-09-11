(function(){
  prettyPrint();
  var lines = document.querySelectorAll('.prettyprint.linenums li[class^="L"]');
  for (var i = 0; i < lines.length; i++) {
    lines[i].id = 'lineNumber' + (i + 1);
  }

  var matched = location.hash.match(/errorLines=([\d,]+)/);
  if (matched) {
    var lines = matched[1].split(',');
    for (var i = 0; i < lines.length; i++) {
      var id = '#lineNumber' + lines[i];
      var el = document.querySelector(id);
      el.classList.add('error-line');
    }
    return;
  }

  if (location.hash) {
    var line = document.querySelector(location.hash);
    if (line) line.classList.add('active');
  }
})();
