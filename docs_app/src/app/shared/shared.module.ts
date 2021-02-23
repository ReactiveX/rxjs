import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from './search-results/search-results.component.js';
import { SelectComponent } from './select/select.component.js';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    SearchResultsComponent,
    SelectComponent
  ],
  declarations: [
    SearchResultsComponent,
    SelectComponent
  ]
})
export class SharedModule {}
