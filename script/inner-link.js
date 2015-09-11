// inner link(#foo) can not correctly scroll, because page has fixed header,
// so, I manually scroll.
(function(){
  var matched = location.hash.match(/errorLines=([\d,]+)/);
  if (matched) return;

  function adjust() {
    window.scrollBy(0, -55);
    var el = document.querySelector('.inner-link-active');
    if (el) el.classList.remove('inner-link-active');

    var el = document.querySelector(location.hash);
    if (el) el.classList.add('inner-link-active');
  }

  window.addEventListener('hashchange', adjust);

  if (location.hash) {
    setTimeout(adjust, 0);
  }
})();
