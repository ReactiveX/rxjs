import {Observable} from 'rx';
import {run} from '@cycle/core';
import {makeDOMDriver, div, h4, p, li, ul, a, span} from 'cycle-snabbdom';
const tree = require('./tree.json');

function intent(domSource) {
  const chooseOption$ = domSource
    .select('.option')
    .events('click')
    .map(ev => ({
      type: 'CHOOSE_OPTION',
      payload: parseInt(ev.currentTarget.dataset.index)
    }));

  const undo$ = domSource
    .select('.undo')
    .events('click')
    .map(() => ({
      type: 'UNDO'
    }));

  const reset$ = domSource
    .select('.reset')
    .events('click')
    .map(() => ({
      type: 'RESET'
    }));

  return Observable.merge(chooseOption$, undo$, reset$);
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

  return Observable.merge(selectReducer$, undoReducer$, resetReducer$)
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
  ]);
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

function main(sources) {
  const action$ = intent(sources.DOM);
  const state$ = model(action$);
  const displayState$ = viewModel(state$);
  const vdom$ = view(displayState$);
  return {
    DOM: vdom$
  };
}

window.addEventListener('load', () => {
  run(main, {
    DOM: makeDOMDriver('.decision-tree-widget')
  });
});
