import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubmissionsRoutingModule } from './submissions-routing.module';
import { SubmissionsListComponent } from './submissions-list/submissions-list.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [SubmissionsListComponent],
  imports: [
    CommonModule,
    SharedModule,
    SubmissionsRoutingModule
  ]
})
export class SubmissionsModule { }
