import {ChangeDetectionStrategy, Component, Output} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {Deprecation, SubjectSymbols} from '../../../data-access';


@Component({
  selector: 'deprecation-item-form',
  template: `
    <form [formGroup]="deprecationForm">
      <mat-form-field class="full">
        <mat-label>SourceLink:</mat-label>
        <input matInput
          placeholder="Link to GitHub in the version it got introduced"
          [formControlName]="'sourceLink'">
      </mat-form-field>
      <br/>

      <mat-form-field>
        <mat-label>Subject:</mat-label>
        <input matInput
          placeholder="Subject of migration" [formControlName]="'subject'">
      </mat-form-field>

      <mat-form-field>
        <mat-label>Subject Symbol</mat-label>
        <mat-select [formControlName]="'subjectSymbol'">
          <mat-option [value]="''">None</mat-option>
          <mat-option [value]="option.key" *ngFor="let option of subjectSymbols| keyvalue">
            {{option.value}}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Subject Action:</mat-label>
        <input matInput placeholder="Action on subject" [formControlName]="'subjectAction'">
      </mat-form-field>
      <br/>

      <mat-form-field class="full">
        <mat-label>Deprecation message from sourcecode:</mat-label>
        <input matInput
          placeholder="The 'HumanReadableShortMessage' part from the code placed next to @deprecated section"
          [formControlName]="'deprecationMsgCode'">
      </mat-form-field>

      <mat-form-field class="full">
        <mat-label>Reason:</mat-label>
        <textarea matInput rows="2"
          placeholder="Short explanation of why the deprecation got introduced"
          [formControlName]="'reason'"></textarea>
      </mat-form-field>

      <mat-form-field class="full">
        <mat-label>Implication:</mat-label>
        <textarea matInput rows="3"
          placeholder="Explains the different between the two versions clearly and accompanies before and after snippets."
          [formControlName]="'implication'"></textarea>
      </mat-form-field>

      <mat-expansion-panel>
        <mat-expansion-panel-header>
          Code Examples
        </mat-expansion-panel-header>

        <mat-form-field class="full">
          <mat-label>Code example before the deprecation:</mat-label>
          <textarea matInput rows="7" [formControlName]="'exampleBefore'"></textarea>
        </mat-form-field>

        <mat-form-field class="full">
          <mat-label>Code example after the deprecation:</mat-label>
          <textarea matInput rows="7" [formControlName]="'exampleAfter'"></textarea>
        </mat-form-field>
      </mat-expansion-panel>
      <br/>

      <mat-form-field>
        <mat-label>BreakingChangeVersion:</mat-label>
        <input matInput placeholder="Semver string of breaking version"
          [formControlName]="'breakingChangeVersion'">
      </mat-form-field>

      <mat-form-field>
        <mat-label>breakingChangeSubjectAction:</mat-label>
        <input matInput placeholder="SubjectAction of related BreakingChange item" [formControlName]="'breakingChangeSubjectAction'">
      </mat-form-field>

    </form>
  `,
  styles: [`
    .full {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeprecationItemFormComponent {

  subjectSymbols = SubjectSymbols;

  deprecationForm = this.fb.group({
    sourceLink: ['', Validators.required],
    subject: [''],
    subjectSymbol: [''],
    subjectAction: [''],
    deprecationMsgCode: ['', Validators.required],
    reason: ['', Validators.required],
    implication: ['', Validators.required],
    exampleBefore: [''],
    exampleAfter: [''],
    breakingChangeVersion: ['', Validators.required],
    breakingChangeSubjectAction: ['', Validators.required]
  });

  latestValidValuePrepared$: Observable<Deprecation> = this.deprecationForm.statusChanges.pipe(
    filter(status => status === 'VALID'),
    withLatestFrom(this.deprecationForm.valueChanges),
    map(([_, v]: [any, Deprecation]) => {
      v.itemType = 'deprecation';
      return v as Deprecation;
    })
  );

  @Output()
  changes: Observable<Deprecation> = this.latestValidValuePrepared$;

  constructor(private fb: FormBuilder) {

  }

}
