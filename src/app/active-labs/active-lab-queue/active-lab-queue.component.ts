import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StaffService } from 'src/app/core/services/staff.service';
import { LabQueueSnapshot, StudentRequest } from 'src/app/models/lab-queue-snapshot.model';
import { CourseUnit } from 'src/app/models/submissions.model';

@Component({
  selector: 'app-active-lab-queue',
  templateUrl: './active-lab-queue.component.html',
  styleUrls: ['./active-lab-queue.component.css']
})
export class ActiveLabQueueComponent implements OnInit {
  unitCode: string;
  staffUnit: CourseUnit;
  labQueue: LabQueueSnapshot;

  constructor(private staffService: StaffService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.unitCode = routeParams.get('unitCode');

    this.loadStaffUnit();
  }

  private loadStaffUnit(refresh = false) {
    this.staffService.getStaffUnit(this.unitCode, refresh).subscribe(staffUnit => {
      // console.log(staffUnit);
      this.staffUnit = staffUnit;
    });
  }

  loadEx() {
    return 'Loaded'!
  }

  getStudents(exId: number): Observable<StudentRequest[]> {
    return this.staffService.getLabQueueSnapshot(exId).pipe(map(queue => queue.studentRequests));
  }

  onRefresh(): void {
    this.loadStaffUnit(true);
  }

}
