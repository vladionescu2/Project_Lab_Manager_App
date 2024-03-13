import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StaffService } from 'src/app/core/services/staff.service';
import { UtilService } from 'src/app/core/services/util.service';
import { CourseUnit, LabFormat } from 'src/app/models/submissions.model';

@Component({
  selector: 'app-active-labs',
  templateUrl: './active-labs.component.html',
  styleUrls: ['./active-labs.component.css']
})
export class ActiveLabsComponent implements OnInit {
  staffUnits: CourseUnit[];


  constructor(private util: UtilService,
    private staffService: StaffService,
    private titleService: Title) { 

  }

  ngOnInit(): void {
    this.titleService.setTitle('Lab Manager - Staff Active Labs');
    this.loadStaffUnits();
  }

  private loadStaffUnits(refresh = false) {
    this.staffService.getStaffUnits(refresh).subscribe(units => {
      units.sort((a, b) => a.upcomingLabTimes.start.getTime() - b.upcomingLabTimes.start.getTime());
      this.staffUnits = units;
    });
  }

  onRefresh(): void {
    this.loadStaffUnits(true);
  }

}
