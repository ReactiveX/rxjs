(function(){
  function toggle(ev) {
    var button = ev.target;
    var parent = ev.target.parentElement;
    while(parent) {
      if (parent.tagName === 'TR' && parent.classList.contains('test-describe')) break;
      parent = parent.parentElement;
    }

    if (!parent) return;

    var direction;
    if (button.classList.contains('opened')) {
      button.classList.remove('opened');
      button.classList.add('closed');
      direction = 'closed';
    } else {
      button.classList.remove('closed');
      button.classList.add('opened');
      direction = 'opened';
    }

    var targetDepth = parseInt(parent.dataset.testDepth, 10) + 1;
    var nextElement = parent.nextElementSibling;
    while (nextElement) {
      var depth = parseInt(nextElement.dataset.testDepth, 10);
      if (depth >= targetDepth) {
        if (direction === 'opened') {
          if (depth === targetDepth)  nextElement.style.display = '';
        } else if (direction === 'closed') {
          nextElement.style.display = 'none';
          var innerButton = nextElement.querySelector('.toggle');
          if (innerButton && innerButton.classList.contains('opened')) {
            innerButton.classList.remove('opened');
            innerButton.classList.add('closed');
          }
        }
      } else {
        break;
      }
      nextElement = nextElement.nextElementSibling;
    }
  }

  var buttons = document.querySelectorAll('.test-summary tr.test-describe .toggle');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', toggle);
  }

  var topDescribes = document.querySelectorAll('.test-summary tr[data-test-depth="0"]');
  for (var i = 0; i < topDescribes.length; i++) {
    topDescribes[i].style.display = '';
  }
})();
