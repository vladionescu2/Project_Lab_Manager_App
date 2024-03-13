import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { delay, filter } from 'rxjs/operators';
import { QueuePositionService } from 'src/app/core/services/queue-position.service';
import { SubmissionService } from 'src/app/core/services/submissions.service';
import { QueuePositions } from 'src/app/models/marking.model';
import { ExerciseRow } from 'src/app/models/submissions-table-row.model';
import { CourseUnitSubmissions, Submission } from 'src/app/models/submissions.model';
import { ExerciseTableComponent } from 'src/app/shared/exercise-table/exercise-table.component';

enum LabStatus {
  Inactive = 0,
  AboutToStart = 1,
  InProgress = 2
}

enum MarkingStatus {
  NoMarking = 'noMarking',
  Changed = 'changed',
  Submitted = 'submitted'
}

const oneSec = 1000;
const oneMin = 60 * oneSec;
const oneHour = 60 * oneMin;
const oneDay = 24 * oneHour;

@Component({
  selector: 'app-lab-window',
  templateUrl: './lab-window.component.html',
  styleUrls: ['./lab-window.component.css']
})
export class LabWindowComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() lab: CourseUnitSubmissions;
  @ViewChild(ExerciseTableComponent) table: ExerciseTableComponent;

  exercises: ExerciseRow[];
  exercisesMap: {[exerciseId: number]: ExerciseRow} = {};
  prestartTime: number = oneMin * 5;
  currentStatus: LabStatus = LabStatus.Inactive;
  currentMarkingStatus: MarkingStatus = MarkingStatus.NoMarking;
  timeToStart = {
    minutes: null,
    seconds: null
  };

  submissionsMap: { [exerciseId: number]: Submission } = {};
  lastConfirmedSelection: { exercises: ExerciseRow[], seatNr: number } = { exercises: [], seatNr: null };

  seatNr = new FormControl('', Validators.required);
  queueSubscription: Subscription;

  constructor(private fb: FormBuilder, 
    private submissionService: SubmissionService, 
    private cd: ChangeDetectorRef,
    private queueService: QueuePositionService) { }

  ngOnDestroy(): void {
    if (this.queueSubscription) {
      console.log("Unsubscribing");
      this.queueSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    const allSubmissions: Submission[] = [];
    this.lab.studentRepos.forEach(studentRepo => allSubmissions.push(...studentRepo.submissions));

    this.exercises = allSubmissions.filter(submission => !submission.marked).map((e) => {
      return {
        id: e.commitId,
        unit: this.lab.courseUnit.unitCode,
        exercise: e.submissionTag,
        date: e.timeStamp,
        deadline: e.labExercise.deadline,
        late: e.late,
        exerciseId: e.labExercise.exerciseId
      }
    });

    this.exercises.forEach(e => {
      this.exercisesMap[e.exerciseId] = e;
    });

    allSubmissions.forEach(e => {
      this.submissionsMap[e.labExercise.exerciseId] = e;
    });
    this.checkTime();
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.requestDisabled = () => {
        return !this.seatNr.valid && this.seatNr.enabled ||
          this.table.selection.selected.length == 0 && this.currentMarkingStatus == MarkingStatus.NoMarking ||
          this.currentMarkingStatus == MarkingStatus.Submitted;
      }
    }, 0);

    // console.log("Registering changes");
    this.table.selection.changed.subscribe(() => {
      // console.log("Changed!");
      
      if (this.currentMarkingStatus == MarkingStatus.Submitted) {
        this.currentMarkingStatus = MarkingStatus.Changed;
      }
    });
  }

  private checkTime() {
    const now = Date.now();
    const timeLeft = this.lab.courseUnit.upcomingLabTimes.start.getTime() - now;
    // console.log(`Time left: ${timeLeft / oneMin} min`);
    if (timeLeft <= this.prestartTime) {
      this.preStartLab();
    }
    else {
      // console.log(`Starting lab in ${timeLeft - oneMin * 5}`);
      window.setTimeout(this.preStartLab.bind(this), timeLeft - oneMin * 5)
    }
  }

  private preStartLab() {
    this.currentStatus = LabStatus.AboutToStart;
    this.checkForPendingSubmissions();
    this.listenForQueueChanges();

    const loop = () => {
      const intervalId = window.setInterval(() => {
        const now = Date.now();
        const timeLeft = this.lab.courseUnit.upcomingLabTimes.start.getTime() - now;
        this.timeToStart.minutes = Math.floor(timeLeft / oneMin);
        this.timeToStart.seconds = Math.floor((timeLeft % (oneMin)) / oneSec);

        if (now >= this.lab.courseUnit.upcomingLabTimes.start.getTime()) {
          window.clearInterval(intervalId);
          this.startLab();
        }
      }, oneSec);
    };

    loop();
  }

  private checkForPendingSubmissions() {
    if (this.exercises.length == 0) {
      return;
    }
    window.setTimeout(() => {
      this.submissionService.getMarkingRequests(this.exercises.map(e => e.exerciseId))
        .pipe(filter(receivedPositions => Object.keys(receivedPositions.positions).length > 0))
        .subscribe(receivedPositions => {
          this.exercises.forEach(ex => {
            ex.queuePos = receivedPositions.positions[ex.exerciseId];
          });
          receivedPositions.ready.forEach(exId => {
            this.exercisesMap[exId].ready = true;
          });

          this.table.selection.select(...this.exercises.filter(e => e.queuePos || e.queuePos === 0));
          this.seatNr.setValue(receivedPositions.seatNr);
          this.lastConfirmedSelection.exercises = this.exercises.filter(e => e.queuePos);
          if (receivedPositions.seatNr) { this.lastConfirmedSelection.seatNr = receivedPositions.seatNr; this.seatNr.disable() }
          this.currentMarkingStatus = MarkingStatus.Submitted;
        });
    }, 0);
  }

  private listenForQueueChanges() {
    if (this.exercises.length == 0) {
      return;
    }
    this.queueSubscription = this.queueService.getQueuePositionStream().subscribe(receivedPositions => {
      console.log("New positions are", receivedPositions);

      const queuePositions = Object.keys(receivedPositions.positions);

      queuePositions.forEach(e => {
        this.exercisesMap[+e].queuePos = receivedPositions.positions[+e]
      });
      receivedPositions.ready.forEach(exId => {
        this.exercisesMap[exId].ready = true;
      });
      if (receivedPositions.marked.length > 0) {
        receivedPositions.marked.forEach(exId => {
          this.submissionsMap[exId].marked = true;
          this.table.selection.deselect(this.exercisesMap[exId]);
        });
        this.exercises = this.exercises.filter(exercie => this.submissionsMap[exercie.exerciseId].marked == false);
        this.currentMarkingStatus = MarkingStatus.Submitted;
      }
    }, error => {
      console.log(error);
      this.listenForQueueChanges();
    });
  }

  private startLab() {
    this.currentStatus = LabStatus.InProgress;
  }

  public onRequest(): void {
    // console.log(`Selected: ${this.table.selection.selected.length}`);
    // console.log("New Request!");

    this.seatNr.disable();
    
    const selected = this.table.selection.selected;

    const toMark = selected.filter(e => !this.lastConfirmedSelection.exercises.includes(e)).map(e => e.exerciseId);
    const toCancel = this.lastConfirmedSelection.exercises.filter(e => !selected.includes(e)).map(e => e.exerciseId);

    toCancel.forEach(e => {
      this.exercisesMap[e].queuePos = null;
      this.exercisesMap[e].ready = false;
    })

    if (toMark.length == 0 && toCancel.length == 0 && this.seatNr.value == this.lastConfirmedSelection.seatNr) {
      this.currentMarkingStatus = MarkingStatus.Submitted;
      return;
    }
    this.submissionService.requestMarking(toMark, toCancel, this.seatNr.value).subscribe(receivedPositions => {
      const queuePositions = Object.keys(receivedPositions.positions);

      queuePositions.forEach(e => {
        this.exercisesMap[+e].queuePos = receivedPositions.positions[+e]
      });

      this.currentMarkingStatus = MarkingStatus.Submitted;
    });
    
    this.lastConfirmedSelection = {
      exercises: this.table.selection.selected,
      seatNr: this.seatNr.value
    };
  }

  public editSeatNr() {
    // console.log("Editting Request");

    this.seatNr.enable();
    this.currentMarkingStatus = MarkingStatus.Changed;
  }

  public cancelEdits() {
    this.seatNr.setValue(this.lastConfirmedSelection.seatNr);
    this.table.selection.deselect(...this.table.selection.selected);
    this.table.selection.select(...this.lastConfirmedSelection.exercises);

    this.seatNr.disable();
    this.currentMarkingStatus = MarkingStatus.Submitted;
  }

  public requestDisabled = () => {
    return true;
  }

}
