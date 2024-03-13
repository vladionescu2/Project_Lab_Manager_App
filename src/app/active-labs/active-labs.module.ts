import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { ActiveLabsRoutingModule } from './active-labs-routing.module';
import { ActiveLabsComponent } from './active-labs/active-labs.component';
import { ActiveLabQueueComponent } from './active-lab-queue/active-lab-queue.component';
import { LabQueueTabComponent } from './active-lab-queue/lab-queue-tab/lab-queue-tab.component'

@NgModule({
  declarations: [ActiveLabsComponent, ActiveLabQueueComponent, LabQueueTabComponent],
  imports: [
    CommonModule,
    ActiveLabsRoutingModule,
    SharedModule
  ]
})
export class ActiveLabsModule { }
