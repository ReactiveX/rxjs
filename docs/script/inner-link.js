// inner link(#foo) can not correctly scroll, because page has fixed header,
// so, I manually scroll.
(function(){
  var matched = location.hash.match(/errorLines=([\d,]+)/);
  if (matched) return;

  function adjust() {
    window.scrollBy(0, -55);
    var el = document.querySelector('.inner-link-active');
    if (el) el.classList.remove('inner-link-active');

    // ``[ ] . ' " @`` are not valid in DOM id. so must escape these.
    var id = location.hash.replace(/([\[\].'"@$])/g, '\\$1');
    var el = document.querySelector(id);
    if (el) el.classList.add('inner-link-active');
  }

  window.addEventListener('hashchange', adjust);

  if (location.hash) {
    setTimeout(adjust, 0);
  }
})();

(function(){
  var els = document.querySelectorAll('[href^="#"]');
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    el.href = location.href + el.getAttribute('href'); // because el.href is absolute path
  }
})();
