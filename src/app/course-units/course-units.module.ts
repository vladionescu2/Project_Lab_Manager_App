import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseUnitsRoutingModule } from './course-units-routing.module';
import { SharedModule } from '../shared/shared.module';
import { StaffCourseUnitsComponent } from './staff-course-units/staff-course-units.component';
import { NewCourseUnitFormComponent } from './staff-course-units/new-course-unit-form/new-course-unit-form.component';
import { NewLabFormatFormComponent } from './staff-course-units/new-lab-format-form/new-lab-format-form.component';

@NgModule({
  declarations: [StaffCourseUnitsComponent, NewCourseUnitFormComponent, NewLabFormatFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    CourseUnitsRoutingModule
  ]
})
export class CourseUnitsModule { }
