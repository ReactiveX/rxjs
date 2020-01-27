import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ClientDeprecation, ClientMigrationTimelineReleaseItem} from '../../data-access';

@Component({
  selector: `code-examples`,
  template: `
    <code-example
      [dependencies]="{rxjs: '<' + _release.version}"
      [language]="'typescript'"
      [title]="'Before Deprecation (< v' + _release.version + ')'">
      {{_deprecation.exampleBefore}}
    </code-example>
    <code-example
      [dependencies]="{rxjs: '>=' + _release.version + ' <=' + _deprecation.breakingChangeVersion}"
      [language]="'typescript'"
      [title]="'After Deprecation (>= v' + _release.version + ')'">
      {{_deprecation.exampleAfter}}
    </code-example>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeExamplesComponent {

  _release: ClientMigrationTimelineReleaseItem;
  @Input()
  set release(release: ClientMigrationTimelineReleaseItem) {
    if (release) {
      this._release = release;
    }
  }

  _deprecation: ClientDeprecation;
  @Input()
  set deprecation(deprecation: ClientDeprecation) {
    if (deprecation) {
      this._deprecation = deprecation;
    }
  }

}
