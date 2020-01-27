import {Component, Input, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {startWith} from 'rxjs/operators';
import {State} from '../../../shared/state.service';
import {MigrationTimelineNavigationItem} from './release-navigation.component';


export interface VmFilterForm {
  from: '',
  to: '',
  official: boolean
}

@Component({
  selector: 'filter-form',
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <form [formGroup]="filterForm">
        <mat-form-field style="width: 200px">
          <mat-label>From Version: {{filterForm.controls.from.value}}</mat-label>
          <mat-select [formControlName]="'from'">
            <mat-option [value]="''">None</mat-option>
            <mat-option [value]="option.version" *ngFor="let option of vm.releaseList">
              {{option.version}}
            </mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field style="width: 200px">
          <mat-label>To Version: {{filterForm.controls.to.value}}</mat-label>
          <mat-select [formControlName]="'to'">
            <mat-option [value]="''">None</mat-option>
            <mat-option [value]="option.version" *ngFor="let option of vm.releaseList">
              {{option.version}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </ng-container>
  `,
  styles: []
})
export class FilterFormComponent extends State<{
  releaseList: MigrationTimelineNavigationItem[]
}> implements OnInit {

  vm$ = this.select();
  filterForm = this.fb.group({
    from: [],
    to: []
  });

  @Input()
  set releaseList(releaseList: MigrationTimelineNavigationItem[]) {
    if (releaseList) {
      this.setState({releaseList});
    }
  }

  @Output()
  filterChange = this.filterForm.valueChanges.pipe(startWith({from: '', to: ''}));

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
  }

}
