import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from '../shared/layout/layout.component';
import { ActiveLabQueueComponent } from './active-lab-queue/active-lab-queue.component';
import { ActiveLabsComponent } from './active-labs/active-labs.component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: ActiveLabsComponent,
      },
      {
        path: ':unitCode',
        component: ActiveLabQueueComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActiveLabsRoutingModule { }
