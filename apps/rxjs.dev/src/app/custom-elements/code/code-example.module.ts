import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from './code-example.component.js';
import { CodeModule } from './code.module.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule, CodeModule],
  declarations: [CodeExampleComponent],
  exports: [CodeExampleComponent],
})
export class CodeExampleModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = CodeExampleComponent;
}
