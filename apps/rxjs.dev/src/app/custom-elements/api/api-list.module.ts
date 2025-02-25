import { NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';
import { ApiListComponent } from './api-list.component';
import { ApiService } from './api.service';
import { WithCustomElementComponent } from '../element-registry';

@NgModule({
  imports: [ CommonModule, FormsModule, SharedModule, HttpClientModule ],
  declarations: [ ApiListComponent ],
  providers: [ ApiService ]
})
export class ApiListModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = ApiListComponent;
}
