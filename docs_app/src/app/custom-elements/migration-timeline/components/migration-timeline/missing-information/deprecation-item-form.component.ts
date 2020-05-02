import {ChangeDetectionStrategy, Component, Output} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {BehaviorSubject, combineLatest, EMPTY, Observable, of, ReplaySubject} from 'rxjs';
import {catchError, concatMap, map, startWith, tap} from 'rxjs/operators';
import {State} from '../../../../../shared/state.service';
import {RawDeprecation, RawRelease, SubjectSymbols} from '../../../data-access';

const subjectSymbols = SubjectSymbols;
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'rxjs-deprecation-item-form',
  template: `
    <mat-form-field class="full">
      <mat-label>Parse Crawled Data</mat-label>
      <input matInput
        placeholder="Paste the deprecation item from crawled data"
        [ngModel]="crawledData$ | async" (ngModelChange)="crawledData$.next($event)">
    </mat-form-field>

    <form [formGroup]="releaseForm">
      <mat-form-field>
        <mat-label>Release Version:</mat-label>
        <input matInput
          placeholder="SemVer of the release"
          [formControlName]="'version'">
      </mat-form-field>
    </form>

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
          <mat-option [value]="option.key" *ngFor="let option of subjectSymbols | keyvalue">
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

      <mat-expansion-panel [expanded]="withCodeExamples$ | async" (expandedChange)="withCodeExamples$.next($event)">
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
        <mat-label>BreakingChangeMsg:</mat-label>
        <input matInput placeholder="Message of related BreakingChange item" [formControlName]="'breakingChangeSubjectAction'">
      </mat-form-field>

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
export class DeprecationItemFormComponent extends State<{ crawledData: any }> {
  crawledData$ = new ReplaySubject<any>(1);
  withCodeExamples$ = new BehaviorSubject<boolean>(false);
  subjectSymbols = subjectSymbols as object;
  defaultValue = '@TODO';
  releaseForm = this.fb.group({
    version: ['7.0.0-alpha.0', Validators.required],
  });
  deprecationForm = this.fb.group({
    sourceLink: ['https://github.com/ReactiveX/rxjs/tree/7.0.0-alpha.0/src', Validators.required],
    subject: [''],
    subjectSymbol: [''],
    subjectAction: ['deprecated'],
    deprecationMsgCode: ['', Validators.required],
    reason: ['', Validators.required],
    implication: ['', Validators.required],
    exampleBefore: [this.defaultValue],
    exampleAfter: [this.defaultValue],
    breakingChangeVersion: ['8.0.0', Validators.required],
    breakingChangeMsg: ['', Validators.required],
    breakingChangeSubjectAction: ['', Validators.required]
  });

  latestValidValuePrepared$: Observable<RawDeprecation> = combineLatest([
    this.deprecationForm.valueChanges.pipe(startWith(this.deprecationForm.value)),
    this.withCodeExamples$
    ]
  ).pipe(
    map(([rawDeprecation, withCodeExamples]) => {
      let deprecation: RawDeprecation = {...rawDeprecation};
      deprecation.itemType = 'deprecation';
      if (!withCodeExamples) {
        const {exampleAfter, exampleAfterDependencies, exampleBefore, exampleBeforeDependencies, ...newDeprecation} = deprecation;
        deprecation = newDeprecation;
      }
      return deprecation;
    })
  );

  @Output()
  changes: Observable<RawDeprecation> = this.latestValidValuePrepared$;
  @Output()
  release: Observable<RawRelease> = this.releaseForm.valueChanges.pipe(startWith(this.releaseForm.value));

  constructor(private fb: FormBuilder) {
    super();
    this.hold(
      this.crawledData$.pipe(
        concatMap(o => of(o).pipe(
          map(str => JSON.parse(str)),
          catchError(_ => EMPTY)
          )
        ),
        tap(r => this.deprecationForm.patchValue(r))
      ));
  }

}
