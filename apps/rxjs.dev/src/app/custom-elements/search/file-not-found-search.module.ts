import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module.js';
import { FileNotFoundSearchComponent } from './file-not-found-search.component.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [FileNotFoundSearchComponent],
})
export class FileNotFoundSearchModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = FileNotFoundSearchComponent;
}
