import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { StaffService } from 'src/app/core/services/staff.service';
import { UtilService } from 'src/app/core/services/util.service';
import { CourseUnit, LabFormat, LabTimes } from 'src/app/models/submissions.model';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { NewCourseUnitFormComponent } from './new-course-unit-form/new-course-unit-form.component';
import { NewLabFormatFormComponent } from './new-lab-format-form/new-lab-format-form.component';

@Component({
  selector: 'app-staff-course-units',
  templateUrl: './staff-course-units.component.html',
  styleUrls: ['./staff-course-units.component.css']
})
export class StaffCourseUnitsComponent implements OnInit {

  constructor(private staffService: StaffService,
    public util: UtilService,
    public dialog: MatDialog,
    private titleService: Title) { }
  staffUnits: CourseUnit[];

  ngOnInit(): void {
    this.titleService.setTitle('Lab Manager - Staff Course Units')
    console.log("Getting course units!");

    this.loadStaffUnits();
  }

  private loadStaffUnits(refresh = false) {
    this.staffService.getStaffUnits(refresh).subscribe(units => {
      units.sort((a, b) => a.unitCode.localeCompare(b.unitCode));
      this.staffUnits = units;
      console.log(this.staffUnits);
    });
  }

  openNewCourseUnitMenu(): void {
    const dialogRef = this.dialog.open(NewCourseUnitFormComponent);

    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        this.loadStaffUnits(true);
      }
    });
  }

  openNewLabFormatMenu(unit: CourseUnit): void {
    const dialogRef = this.dialog.open(NewLabFormatFormComponent, {
      data: {staffUnit: unit}
    });

    dialogRef.afterClosed().subscribe(value => {
      if (value) {
        this.loadStaffUnits(true);
      }
    });
  }

  confirmDeleteUnit(unitCode: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: "Delete Course Unit Confirmation", message: "This action cannot be reverted! Are you sure you want to proceed?"}
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        console.log("Confirmed");
        this.staffService.deleteUnit(unitCode).subscribe();
        window.setTimeout(() => {
          this.loadStaffUnits(true);
        }, 1000);
      }
    });
  }

  confirmDeleteFormat(format: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {title: "Delete Lab Format Confirmation", message: "This action cannot be reverted! Are you sure you want to proceed?"}
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.staffService.deleteLabFornat(format).subscribe();
        window.setTimeout(() => {
          this.loadStaffUnits(true);
        }, 1000);
      }
    });
  }

  onRefresh(): void {
    this.loadStaffUnits(true);
  }
}
