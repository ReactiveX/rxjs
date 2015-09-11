(function(){
  function toggle(ev) {
    var button = ev.target;
    var parent = ev.target.parentElement;
    while(parent) {
      if (parent.tagName === 'TABLE' && parent.classList.contains('summary')) break;
      parent = parent.parentElement;
    }

    if (!parent) return;

    var tbody = parent.querySelector('tbody');
    if (button.classList.contains('opened')) {
      button.classList.remove('opened');
      button.classList.add('closed');
      tbody.style.display = 'none';
    } else {
      button.classList.remove('closed');
      button.classList.add('opened');
      tbody.style.display = 'block';
    }
  }

  var buttons = document.querySelectorAll('.inherited-summary thead .toggle');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', toggle);
  }
})();
