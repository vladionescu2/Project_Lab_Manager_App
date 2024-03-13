import { Inject, Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { CourseUnitSubmissions } from '../../models/submissions.model';
import { Observable } from 'rxjs/Observable';
import { map, shareReplay } from 'rxjs/operators';
import { AuthenticationService } from './auth.service';
import { QueuePositions } from 'src/app/models/marking.model';
import { UtilService } from './util.service';
import { use } from 'chai';

@Injectable({
  providedIn: 'root'
}
)
export class SubmissionService implements OnInit {
  private labManagerUrl: string = 'lab-manager';
  private responseCache: {
    forUser: string,
    data$: Observable<CourseUnitSubmissions[]>
  } = {
    forUser: null,
    data$: null,
  }
  private response$: Observable<CourseUnitSubmissions[]>;
  private lastUser: string;

  constructor(@Inject('SESSIONSTORAGE') private sessionStorage: Storage, 
    private http: HttpClient, 
    private util: UtilService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.lastUser = this.authService.getUser().userName;
  }

  public findMySubmissions(refresh = false): Observable<CourseUnitSubmissions[]> {
    const userName = this.authService.getUser().userName;

    if (refresh || this.responseCache.forUser != userName || !this.responseCache.data$) {
      console.log("Making new HTTP request");
      this.responseCache.forUser = userName;
      this.responseCache.data$ = this.http.get<CourseUnitSubmissions[]>(`${this.labManagerUrl}/submission/${userName}`)
      .pipe(
        map(obj => this.util.stringToDate(obj)),
        shareReplay(1),
        map(obj => this.util.setAllUpcomingLabTimes(obj))
      );
    }

    return this.responseCache.data$;
  }

  public requestMarking(toMark: number[], toCancel: number[], seatNr: number): Observable<QueuePositions> {
    console.log("Requesting...");
    const userName = this.authService.getUser().userName;
    
    return this.http.post<QueuePositions>(`${this.labManagerUrl}/marking/${userName}`, { toMark, toCancel, seatNr });
  }

  public getMarkingRequests(exerciseIds: number[]): Observable<QueuePositions> {
    const userName = this.authService.getUser().userName;
    const stringNumbers = exerciseIds.map(String);

    return this.http.get<QueuePositions>(`${this.labManagerUrl}/marking/${userName}`, {params: {exerciseIds: stringNumbers}});
  }

}
