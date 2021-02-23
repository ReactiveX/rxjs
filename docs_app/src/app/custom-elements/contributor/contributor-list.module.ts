import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributorListComponent } from './contributor-list.component.js';
import { ContributorService } from './contributor.service.js';
import { ContributorComponent } from './contributor.component.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule],
  declarations: [ContributorListComponent, ContributorComponent],
  entryComponents: [ContributorListComponent],
  providers: [ContributorService],
})
export class ContributorListModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = ContributorListComponent;
}
