import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, mapTo, shareReplay } from 'rxjs/operators';
import { OperatorDecisionTree, OperatorTreeNode, State } from './interfaces';
import { OperatorDecisionTreeDataService } from './operator-decision-tree-data.service';
import { isInitialDecision, nodeHasOptions, treeIsErrorFree } from './utils';

@Injectable()
export class OperatorDecisionTreeService {
  private initialState: State = {
    previousBranchIds: ['initial'],
    currentBranchId: 'initial'
  };
  private state$ = new BehaviorSubject<State>(this.initialState);
  private tree$: Observable<
    OperatorDecisionTree
  > = this.dataService.getDecisionTree$().pipe(
    catchError(error => of({ error })), // This helps if the JSON for some reason fails to get fetched
    shareReplay()
  );

  currentSentence$: Observable<string> = combineLatest(
    this.tree$,
    this.state$
  ).pipe(
    filter(([tree]) => treeIsErrorFree(tree)),
    map(([tree, { previousBranchIds }]) =>
      isInitialDecision(previousBranchIds)
        ? 'Start by choosing an option from the list below.'
        : `${previousBranchIds
            .map(entityId => {
              return tree[entityId].label;
            })
            .join(' ')}...`.trim()
    )
  );

  options$: Observable<(OperatorTreeNode)[]> = combineLatest(
    this.tree$,
    this.state$
  ).pipe(
    filter(([tree, state]) => {
      return (
        treeIsErrorFree(tree) &&
        !!tree[state.currentBranchId] &&
        !!tree[state.currentBranchId].options
      );
    }),
    map(([tree, state]) => {
      // Project is currently using TypeScript 2.9.2
      // With TS 3.1+ this can be done better if we map to [tree, node] and typeguard with a tuple in a filter
      // filter((a): a is [OperatorDecisionTree, OperatorTreeNodeWithOptions] => !a[0].error && !!a[1].options)
      const node = tree[state.currentBranchId];
      return nodeHasOptions(node)
        ? node.options.map(option => tree[option])
        : tree['initial'].options.map(option => tree[option]);
    })
  );

  isBeyondInitialQuestion$: Observable<boolean> = this.state$.pipe(
    map(({ currentBranchId }) => currentBranchId !== 'initial')
  );

  // This helps if the JSON for some reason fails to get fetched
  hasError$ = this.tree$.pipe(
    filter(tree => !!tree.error),
    mapTo(true)
  );

  constructor(private dataService: OperatorDecisionTreeDataService) {}

  private get snapShot(): State {
    return this.state$.getValue();
  }

  selectOption(optionId: string): void {
    this.state$.next({
      previousBranchIds: [...this.snapShot.previousBranchIds, optionId],
      currentBranchId: optionId
    });
  }

  back(): void {
    const previousOptionId = this.snapShot.previousBranchIds[
      this.snapShot.previousBranchIds.length - 2
    ];

    if (previousOptionId) {
      this.state$.next({
        previousBranchIds: [
          ...this.snapShot.previousBranchIds.slice(
            0,
            this.snapShot.previousBranchIds.length - 1
          )
        ],
        currentBranchId: previousOptionId
      });
    }
  }

  startOver(): void {
    this.state$.next(this.initialState);
  }
}
