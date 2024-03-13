import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';
import { SubmissionService } from 'src/app/core/services/submissions.service';
import { ExerciseRow } from 'src/app/models/submissions-table-row.model';
import { CourseUnitSubmissions, StudentRepo, Submission } from 'src/app/models/submissions.model';
import { ExerciseTableComponent } from 'src/app/shared/exercise-table/exercise-table.component';

@Component({
  selector: 'app-submissions-list',
  templateUrl: './submissions-list.component.html',
  styleUrls: ['./submissions-list.component.css']
})
export class SubmissionsListComponent implements OnInit {
  private submissions: CourseUnitSubmissions[];
  private _unsubscribe = new Subject<void>();
  private isLoading = true;
  exercises: Array<ExerciseRow>;

  filterTableFormGroup: FormGroup = null;

  @ViewChild(ExerciseTableComponent)
  table: ExerciseTableComponent;

  constructor(private fb: FormBuilder,
    private submissionService: SubmissionService,
    private titleService: Title) {
      
  }

  setExercises(submissions: CourseUnitSubmissions[]) {
    this.exercises = [];
    submissions.forEach(unit => unit.studentRepos.forEach(studentRepo => {
      this.exercises.push(...studentRepo.submissions.map(submission => { return {
        repoName: studentRepo.repoName,
        id: submission.commitId,
        unit: unit.courseUnit.unitCode,
        exercise: submission.labExercise.exerciseName,
        date: submission.timeStamp,
        deadline: submission.labExercise.deadline,
        late: submission.late,
        exerciseId: submission.labExercise.exerciseId
      }}));
    }));
  }

  get columns(): string[] {
    return ['unit', 'exercise', 'repoName', 'date', 'deadline']
  }

  ngOnInit() {
    this.titleService.setTitle('Lab Manager - Submissions');
    this.loadTableData();
  }

  private loadTableData(refresh?: boolean) {
    this.isLoading = true;

    this.submissionService.findMySubmissions(refresh).pipe(distinctUntilChanged()).subscribe((value: CourseUnitSubmissions[]) => {
      this.submissions = value;
      this.setExercises(value);
      this.isLoading = false;
    });
  }

  trackByFn(submission: ExerciseRow) {
    return submission.id;
  }

  onRefresh() {
    this.loadTableData(true);
  }

}
