import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { LabWindowComponent } from './lab-window/lab-window.component';

@NgModule({
  declarations: [DashboardHomeComponent, LabWindowComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule
  ],
  entryComponents: []
})
export class DashboardModule { }
