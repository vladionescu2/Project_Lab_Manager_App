import { Component, OnInit } from '@angular/core';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Title } from '@angular/platform-browser';
import { NGXLogger } from 'ngx-logger';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SubmissionService } from 'src/app/core/services/submissions.service';
import { LabTimes, CourseUnitSubmissions, StudentRepo, Submission } from 'src/app/models/submissions.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { UtilService } from 'src/app/core/services/util.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  currentUser: any;
  submissions: CourseUnitSubmissions[];
  // public labWindows: Array<LabWindowModel>;
  private isLoading = true;

  constructor(private notificationService: NotificationService,
    private authService: AuthenticationService,
    private titleService: Title,
    private util: UtilService,
    private logger: NGXLogger,
    private submissionService: SubmissionService) {
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadSubmissionData();

    this.titleService.setTitle('Lab Manager - Dashboard');
    this.logger.log('Dashboard loaded');


    setTimeout(() => {
      this.notificationService.openSnackBar('Welcome!');
    });
  }

  loadSubmissionData(refresh = false): void {
    this.submissionService.findMySubmissions(refresh).pipe(distinctUntilChanged()).subscribe((submissions: CourseUnitSubmissions[]) => {
      console.log(submissions);
      // this.submissions = submissions;
      // let labWindowsMap = new Map<String, LabWindowModel>();

      // Object.values(submissions).forEach((e: StudentRepo) => {
      //   const unitCode = e.lab.courseUnit.unitCode;
      //   if (labWindowsMap.has(unitCode)) {
      //     labWindowsMap.get(unitCode).submissions.push(...Object.values(e.submissions));
      //   }
      //   else {
      //     labWindowsMap.set(unitCode, {
      //       labFormat: e.lab,
      //       submissions: Object.values(e.submissions).filter((e: Submission) => !e.marked),
      //       upcomingLab: this.util.findUpcomingLab(e.lab.courseUnit.labTimes)
      //     });
      //   }
      // });
      // console.log(labWindowsMap);
      // this.labWindows = Array.from(labWindowsMap, ([name, value]) => value)
      //   .sort((a: LabWindowModel, b: LabWindowModel) =>
      //     a.upcomingLab.start.getTime() - b.upcomingLab.start.getTime())
      //   ;
      submissions.forEach(submission => {
        submission.courseUnit.upcomingLabTimes = this.util.findUpcomingLab(submission.courseUnit.labTimes);
      });

      submissions.sort((a, b) => a.courseUnit.upcomingLabTimes.start.getTime() - b.courseUnit.upcomingLabTimes.start.getTime());

      // FOR TESTING
      const newDateTime = Date.now() + 0.5 * 1000 * 60;
      submissions[0].courseUnit.upcomingLabTimes.start = new Date(newDateTime);
      submissions[0].courseUnit.upcomingLabTimes.end = new Date(newDateTime + 1000 * 60 * 120);

      this.submissions = submissions;
      this.isLoading = false;
    });
  }

  onRefresh(): void {
    this.isLoading = true;
    this.loadSubmissionData(true);
  }
}
