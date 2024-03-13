import { Component, OnInit } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { StaffService } from 'src/app/core/services/staff.service';
import { LabTimes } from 'src/app/models/submissions.model';
import { NewCourseUnitRequest } from 'src/app/models/staff.model';
import { valueAlreadyUsedValidator } from 'src/app/util/validators';
import * as _ from 'lodash';

@Component({
  selector: 'app-new-course-unit-form',
  templateUrl: './new-course-unit-form.component.html',
  styleUrls: ['./new-course-unit-form.component.css']
})
export class NewCourseUnitFormComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  courseUnitForm = this.fb.group({
    unitCode: ['', [Validators.required, Validators.pattern(/^[A-Z]+[0-9]+$/)]]
  });
  datePicker = new FormControl();
  allUnitCodes: string[];

  labDatesSource: LabTimes[] = [];
  staffMembers: string[] = [];

  constructor(private fb: FormBuilder, 
    private staff: StaffService,
    public dialogRef: MatDialogRef<NewCourseUnitFormComponent>) { 
  }

  get unitCodeControl() {
    return this.courseUnitForm.get('unitCode');
  }

  getUnitCodeError() {
    if (this.unitCodeControl.errors.required) {
      return 'Unit code is required';
    }
    if (this.unitCodeControl.errors.valueAlreadyUsed) {
      return 'Name already in use';
    }
    if (this.unitCodeControl.errors.pattern) {
      return 'Unit code must be a series of letters followed by a number';
    }
  }

  ngOnInit(): void {
    this.staff.getAllCourseUnitCodes().subscribe(allCodes => {
      this.allUnitCodes = allCodes;
      // console.log(allCodes);

      this.unitCodeControl.setValidators([Validators.required, Validators.pattern(/^[A-Z]+[0-9]+$/), valueAlreadyUsedValidator(allCodes)]);
      this.unitCodeControl.updateValueAndValidity();
    });
  }

  addNewDate(event: MatDatepickerInputEvent<Date>): void {
    const timeSet = event.value.getTime();
    this.datePicker.reset();

    this.labDatesSource.push({start: new Date(timeSet), end: new Date(timeSet)});
  }

  removeDate(date: LabTimes) {
    const index = this.labDatesSource.indexOf(date);

    if (index > 0) {
      this.labDatesSource.splice(index, 1);
    }
    else {
      this.labDatesSource = this.labDatesSource.slice(1);
    }
  }


  setNewTime(event: any, date: Date) {
    // console.log("New time is ", time);
    console.log("Old date is  ", date);
    console.log(event.target.value);
    const splitted = event.target.value.split(':');
    date.setHours(+splitted[0], +splitted[1]);
    console.log("New date is ", date);

    console.log("All dates:", this.labDatesSource);
  }

  addStaff(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.staffMembers.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  onChange() {
    console.log("Changed!");
  }

  removeStaff(staffMember: string): void {
    const index = this.staffMembers.indexOf(staffMember);

    if (index >= 0) {
      this.staffMembers.splice(index, 1);
    }
  }

  onSubmit() {
    console.log("Dates are", this.labDatesSource);
    const newCourseUnitRequest: NewCourseUnitRequest = {
      unitCode: this.courseUnitForm.get('unitCode').value,
      staffMembers: this.staffMembers,
      labDates: this.labDatesSource 
    }

    console.log(newCourseUnitRequest);
    this.staff.createNewCourseUnit(newCourseUnitRequest).subscribe(newcourseUnit => console.log(newcourseUnit));
    this.dialogRef.close(true);
  }
}
