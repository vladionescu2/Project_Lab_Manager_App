import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StaffService } from 'src/app/core/services/staff.service';
import { NewLabFormatRequest } from 'src/app/models/staff.model';
import { CourseUnit } from 'src/app/models/submissions.model';
import { valueAlreadyUsedValidator } from 'src/app/util/validators';

@Component({
  selector: 'app-new-lab-format-form',
  templateUrl: './new-lab-format-form.component.html',
  styleUrls: ['./new-lab-format-form.component.css']
})
export class NewLabFormatFormComponent implements OnInit {
  private allFormats: string[];
  constructor(private staff: StaffService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewLabFormatFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {staffUnit: CourseUnit}) { }

  form = this.fb.group({
    repoName: ['', [Validators.required, Validators.pattern(/^[a-zA-z0-9_]+$/)]]
  });

  labExercises: FormGroup[] = [];
  
  ngOnInit(): void {
    this.staff.getAllLabFormatNames().subscribe(formats => {
      this.allFormats = formats.map(format => format.toLowerCase());

      this.repoName.setValidators([Validators.required, Validators.pattern(/^[a-zA-z0-9_]+$/), valueAlreadyUsedValidator(formats)]);
      this.repoName.updateValueAndValidity();
    });
  }

  get repoName() {
    return this.form.get('repoName');
  }

  getNameError(control: AbstractControl) {
    if (control.errors.required) {
      return 'Name is required';
    }
    if (control.errors.valueAlreadyUsed) {
      return 'Name is already in use';
    }
    if (control.errors.pattern) {
      return 'Name must only contain alphanumeric characters or underscore';
    }
  }

  public addNewExercise(): void {
    console.log("Adding new date");

    this.labExercises.push(new FormGroup({
      exerciseName: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-z0-9_]+$/)]),
      deadline: new FormControl('',[Validators.required])
    }));
  }

  public removeExercise(exGroup: FormGroup): void {
    const index = this.labExercises.indexOf(exGroup);

    if (index > 0) {
      this.labExercises.splice(index, 1);
    }
    else {
      this.labExercises = this.labExercises.slice(1);
    }
  }

  public setDate(event: MatDatepickerInputEvent<any>, formControl: FormControl) {
    formControl.setValue(event.value.toDate());
  }

  public setNewTime(event: any, dateControl: FormControl): void {
    const splitted = event.target.value.split(':');
    const currentDate = dateControl.value;
    currentDate.setHours(+splitted[0], +splitted[1]);

    dateControl.setValue(currentDate);
    console.log("New date is", dateControl.value);
  }

  isDisabled() {
    return !this.form.valid || this.labExercises.length == 0 || (this.labExercises.filter(labExercise => !labExercise.valid).length != 0)
  }

  onSubmit() {
    const newLabFormatData: NewLabFormatRequest = {
      forUnitCode: this.data.staffUnit.unitCode,
      repoNameFormat: this.repoName.value,
      labExercises: this.labExercises.map(exerciseGroup => exerciseGroup.value)
    };

    this.staff.createNewLabFormat(newLabFormatData).subscribe();
    this.dialogRef.close(true);
  }
}
