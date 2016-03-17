const snabbdom = require('snabbdom');
const classModule = require('snabbdom/modules/class');
const propsModule = require('snabbdom/modules/props');
const styleModule = require('snabbdom/modules/style');
const attrsModule = require('snabbdom/modules/attributes');
const h = require('snabbdom/h');
const {div, h4, p, li, ul, a, span} = require('hyperscript-helpers')(h);
const tree = require('./tree.json');
const patch = snabbdom.init([classModule, propsModule, styleModule, attrsModule]);

function intent(containerElem) {
  const click$ = Rx.Observable.fromEvent(containerElem, 'click');

  const chooseOption$ = click$
    .filter(ev => ev.target.className === 'option')
    .map(ev => ({
      type: 'CHOOSE_OPTION',
      payload: parseInt(ev.target.dataset.index)
    }));

  const undo$ = click$
    .filter(ev => ev.target.className === 'undo')
    .map(() => ({
      type: 'UNDO'
    }));

  const reset$ = click$
    .filter(ev => ev.target.className === 'reset')
    .map(() => ({
      type: 'RESET'
    }));

  return Rx.Observable.merge(chooseOption$, undo$, reset$);
}

function model(action$) {
  const initialState = {tree: tree, current: []};

  const selectReducer$ = action$
    .filter(action => action.type === 'CHOOSE_OPTION')
    .map(action => function (state) {
      return {
        ...state,
        current: state.current.concat(action.payload)
      };
    });

  const undoReducer$ = action$
    .filter(action => action.type === 'UNDO')
    .map(() => function (state) {
      let newCurrent = state.current.slice();
      newCurrent.pop();
      return {
        ...state,
        current: newCurrent
      };
    });

  const resetReducer$ = action$
    .filter(action => action.type === 'RESET')
    .map(() => function (state) {
      return initialState;
    });

  return Rx.Observable.merge(selectReducer$, undoReducer$, resetReducer$)
    .scan((state, reducer) => reducer(state), initialState)
    .startWith(initialState);
}

function viewModel(state$) {
  return state$.map(state => {
    let previous = [];
    let currentTree = state.tree;
    for (let i = 0; i < state.current.length; i++) {
      previous.push(currentTree.children[state.current[i]].label);
      currentTree = currentTree.children[state.current[i]];
    }
    previous = previous.join(' ');
    return {
      previous,
      options: currentTree.children
    }
  });
}

function renderCurrentSentence(state) {
  const WELCOME_SENTENCE = 'Do you need to find an operator for your problem? ' +
    'Start by choosing an option from the list below:';
  return p('.current-sentence', [
    !state.previous ? WELCOME_SENTENCE : null,
    state.previous ? `"${state.previous}${state.options.length === 1 ? '.' : '...'}"` : null,
    state.previous ? span('.undo', '\u21A9\u00A0Undo') : null,
    state.previous ? span('.reset', 'Or\u00A0reset') : null
  ].filter(x => x !== null));
}

function renderOption(option, index) {
  const endString = option.children.length > 1 ? '...' : '.';
  return li('.option',
    {attrs: {'data-index': index}},
    `${option.label}${endString}`
  );
}

const OBSERVABLE_PATH = './class/es6/Observable.js~Observable.html';

function renderStaticDecision(option) {
  const label = option.label.replace('Observable.', '');
  return h4('.decision', [
    '\u00BB You want the static operator ',
    a(
      {attrs: {href: `${OBSERVABLE_PATH}#static-method-${label}`}},
      label
    ),
    '.'
  ]);
}

function renderInstanceDecision(option) {
  return h4('.decision', [
    '\u00BB You want the instance operator ',
    a(
      {attrs: {href: `${OBSERVABLE_PATH}#instance-method-${option.label}`}},
      option.label
    ),
    '.'
  ]);
}

function renderItem(option, index) {
  if (option.children) {
    return renderOption(option, index);
  } else if (option.label.match(/^Observable\./)) {
    return renderStaticDecision(option);
  } else {
    return renderInstanceDecision(option);
  }
}

function view(state$) {
  return state$.map(state =>
    div([
      renderCurrentSentence(state),
      ul(state.options.map(renderItem))
    ])
  );
}

function main(containerElem) {
  const action$ = intent(containerElem);
  const state$ = model(action$);
  const displayState$ = viewModel(state$);
  const vdom$ = view(displayState$);
  return {
    DOM: vdom$
  };
}

window.addEventListener('load', () => {
  const container = document.querySelector('.decision-tree-widget');
  const vdom$ = main(container).DOM;
  vdom$.startWith(container).pairwise().subscribe(([a,b]) => { patch(a,b); });
});
