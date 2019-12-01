import {Component, Input} from '@angular/core';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {BreakingChange} from '../../data-access/interfaces';
import {LocalState} from '../../utils/local-state.service';
import {getItemHash} from '../../utils/operators';

@Component({
  selector: `breaking-change-description-table`,
  template: `
    <table *ngIf="vm$ | async as vm">
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="vm.breakingChange.subjectApiSymbol"></span>
          <code>{{vm.breakingChange.subject}}</code>
        </th>
        <th>
          Deprecated in version
          <a class="release-link" [href]="deprecationLink$ | async">
            v{{vm.breakingChange.deprecationVersion}}
          </a>
        </th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>
          <b>Refactoring</b>
        </td>
        <td>
          <p>
            For refactoring suggestions please visit the version of deprecation: <a class="release-link"
            [href]="vm.breakingChange.deprecationLink">v{{vm.breakingChange.deprecationVersion}}</a>
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  `
})
export class BreakingChangeDescriptionTableComponent extends LocalState<{
  breakingChange: BreakingChange;
  baseURL: string;
}> {
  vm$ = this.select();
  breakingChange$ = this.select('breakingChange');
  baseURL$ = this.select('baseURL');

  deprecationLink$ = combineLatest(this.breakingChange$, this.baseURL$)
    .pipe(
      map(([b, url]) => url + '#' + getItemHash(b, {type: 'deprecation', version: b.deprecationVersion, link: b.deprecationLink}))
    );


  @Input()
  set baseURL(baseURL: string) {
    if (baseURL) {
      this.setSlice({baseURL});
    }
  }

  @Input()
  set breakingChange(breakingChange: BreakingChange) {
    if (breakingChange) {
      this.setSlice({breakingChange});
    }
  }

}


