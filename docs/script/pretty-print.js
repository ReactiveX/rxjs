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
    // ``[ ] . ' " @`` are not valid in DOM id. so must escape these.
    var id = location.hash.replace(/([\[\].'"@$])/g, '\\$1');
    var line = document.querySelector(id);
    if (line) line.classList.add('active');
  }
})();
