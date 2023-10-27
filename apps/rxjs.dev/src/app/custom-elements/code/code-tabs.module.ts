import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeTabsComponent } from './code-tabs.component.js';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CodeModule } from './code.module.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule, MatCardModule, MatTabsModule, CodeModule],
  declarations: [CodeTabsComponent],
  exports: [CodeTabsComponent],
})
export class CodeTabsModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = CodeTabsComponent;
}
