import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {ClientBreakingChange} from '../../data-access';

@Component({
  selector: `breaking-change-description-table`,
  template: `
    <table>
      <thead>
      <tr>
        <th class="subject">
          <span class="symbol" [ngClass]="breakingChangeVal.subjectSymbol"></span>
          <code>{{breakingChangeVal.subject}}</code>
        </th>
        <th>
          Deprecated in version
          <a class="release-link"
            (click)="selectedMigrationItemUIDChange.next(breakingChangeVal.opponentMigrationItemUID)">
            v{{breakingChangeVal.deprecationVersion}}
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
            For refactoring suggestions please visit the version of deprecation:
            (click)="migrationItemUidSelectRequest.next(vm.breakingChangeVal.opponentMigrationItemUID)
            <a class="release-link">v{{breakingChangeVal.deprecationVersion}}</a>
          </p>
        </td>
      </tr>
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreakingChangeDescriptionTableComponent {

  @Output()
  selectedMigrationItemUIDChange = new Subject<string>();

  breakingChangeVal: ClientBreakingChange;
  @Input()
  set breakingChange(breakingChange: ClientBreakingChange) {
    if (breakingChange) {
      this.breakingChangeVal = breakingChange;
    }
  }

}


