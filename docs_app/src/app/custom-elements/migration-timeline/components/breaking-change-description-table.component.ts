import {Component, Input} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {VmBreakingChange} from '../interfaces';


@Component({
  selector: `breaking-change-description-table`,
  template: `
    <table *ngIf="b$ | async as b">
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="b.subjectApiSymbol"></span>
          <code>{{b.subject}}</code>
        </th>
        <th>{{b.deprecationVersionText}}<a class="release-link" [href]="b.deprecationLink">v{{b.deprecationVersion}}</a></th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td>
          <b>{{b.refactoringTitle}}</b>
        </td>
        <td>
          <p>
            {{b.refactoringText}}
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  `
})
export class BreakingChangeDescriptionTableComponent {
  b$ = new ReplaySubject<VmBreakingChange>(1);
  @Input()
  set breakingChange(d: VmBreakingChange) {
    if (d) {
      this.b$.next(d);
    }
  }
}


