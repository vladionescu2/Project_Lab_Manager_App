import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { StaffService } from 'src/app/core/services/staff.service';
import { LabQueueSnapshot, StudentRequest } from 'src/app/models/lab-queue-snapshot.model';

@Component({
  selector: 'app-lab-queue-tab',
  templateUrl: './lab-queue-tab.component.html',
  styleUrls: ['./lab-queue-tab.component.css']
})
export class LabQueueTabComponent implements OnInit, OnDestroy {
  @Input() exId: number;
  private subscription: Subscription;
  labQueue: LabQueueSnapshot;
  selectedStudent: StudentRequest;

  constructor(private staff: StaffService) { }

  ngOnDestroy(): void {
    if (this.subscription) {
      console.log("Unsubscribing!");
      this.subscription.unsubscribe;
    }
  }

  ngOnInit(): void {
    this.staff.getLabQueueSnapshot(this.exId).subscribe(queue => {
      this.labQueue  = queue;
      this.subscription = this.staff.getLabQueueStream(this.exId).subscribe(queue => {
        console.log(queue);
        this.labQueue = queue;
      });
    });

    this.staff.getPendingStudent(this.exId).pipe(filter(studentRequest => studentRequest != null && studentRequest.userName != null)).subscribe(studentRequest => {
      this.selectedStudent = studentRequest;
    });
  }

  getNextStudent(): void {
    this.staff.getNextStudent(this.exId).subscribe(studentRequest => {
      this.selectedStudent = studentRequest;
    });
  }

  studentMarked(): void {
    this.staff.studentMarked(this.exId).subscribe();

    this.selectedStudent = null;
  }
}
