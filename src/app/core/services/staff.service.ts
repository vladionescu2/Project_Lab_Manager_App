import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { catchError, filter, map, shareReplay, tap } from 'rxjs/operators';
import { LabQueueSnapshot, StudentRequest } from 'src/app/models/lab-queue-snapshot.model';
import { CourseUnit, LabFormat } from 'src/app/models/submissions.model';
import { AuthenticationService } from './auth.service';
import { UtilService } from './util.service';

import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import { NewCourseUnitRequest, NewLabFormatRequest } from 'src/app/models/staff.model';
const EventSource = NativeEventSource || EventSourcePolyfill;

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  private labManagerUrl: string = 'lab-manager';
  private responseCache: {
    forUser: string,
    data$: Observable<CourseUnit[]>
  } = {
    forUser: null,
    data$: null,
  }

  constructor(private authService: AuthenticationService, 
    private http: HttpClient,
    private util: UtilService) {
      this.authService.staffService = this;
    }

  public deleteUnit(unitCode: string): Observable<string> {
    return this.http.delete(`${this.labManagerUrl}/staff/course-unit/${unitCode}`, {responseType: 'text'});
  }

  public deleteLabFornat(labFormat: string): Observable<string> {
    return this.http.delete(`${this.labManagerUrl}/staff/lab-format/${labFormat}`, {responseType: 'text'});
  }

  public getStaffUnits(refresh = false): Observable<CourseUnit[]> {
    const userName = this.authService.getUser().userName;

    if (refresh || this.responseCache.forUser != userName || !this.responseCache.data$) {
      console.log("Making new HTTP request");
      this.responseCache.forUser = userName;
      this.responseCache.data$ = this.http.get<CourseUnit[]>(`${this.labManagerUrl}/staff/course-units/${userName}`)
      .pipe(
        map(obj => this.util.stringToDate(obj)),
        shareReplay(1),
        map(obj => this.util.setAllUpcomingLabTimesStaff(obj))
      );
    }

    return this.responseCache.data$;
  }

  public getStaffUnit(unitCode: string, refresh = false): Observable<CourseUnit> {
    return this.getStaffUnits(refresh).pipe(map(courseUnits => courseUnits.filter(courseUnit => courseUnit.unitCode == unitCode)[0]));
  }

  public getPendingStudent(exId: number): Observable<StudentRequest> {
    const userName = this.authService.getUser().userName;

    return this.http.get<StudentRequest>(`${this.labManagerUrl}/staff/pending-student/${exId}/${userName}`);
  }

  public getAllCourseUnitCodes(): Observable<string[]> {

    return this.http.get<string[]>(`${this.labManagerUrl}/staff/all-codes`);
  }

  public getAllLabFormatNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.labManagerUrl}/staff/all-formats`)
  }

  public createNewCourseUnit(newCourseUnitData: NewCourseUnitRequest): Observable<CourseUnit> {
    return this.http.post<CourseUnit>(`${this.labManagerUrl}/staff/new-unit`, newCourseUnitData);
  }

  public createNewLabFormat(newLabFormatData: NewLabFormatRequest) {
    return this.http.post<LabFormat>(`${this.labManagerUrl}/staff/new-lab-format`, newLabFormatData);
  }

  public getNextStudent(exId: number): Observable<StudentRequest> {
    const userName = this.authService.getUser().userName;

    return this.http.get<StudentRequest>(`${this.labManagerUrl}/staff/next-student/${exId}/${userName}`);
  }

  public studentMarked(exId: number): Observable<string> {
    const userName = this.authService.getUser().userName;

    return this.http.get(`${this.labManagerUrl}/staff/student-marked/${exId}/${userName}`, {responseType:"text"});
  }

  public getLabQueueSnapshot(exId: number) {
    return this.http.get<LabQueueSnapshot>(`${this.labManagerUrl}/staff/lab-queue/${exId}`);
  }

  public getLabQueueStream(exId: number): Observable<LabQueueSnapshot> {
    const createNewEventSource = (observer: Subscriber<LabQueueSnapshot>) => {
      const eventSource = new EventSource(`${this.labManagerUrl}/staff/stream/lab-queue/${exId}`);

      eventSource.addEventListener('lab-snapshot', event => { console.log("New event!"); observer.next(JSON.parse(event.data)) });
      eventSource.onmessage = event => { console.log("New event!"); observer.next(JSON.parse(event.data)) };
      eventSource.onerror = event => { observer.error(event) };

      return () => {
        console.log("Stopping EventSource");
        eventSource.close();
      }
    }
    
    const queuePos$ = new Observable(createNewEventSource).pipe(catchError(e => {
      console.log('Error on queue stream', e); return this.getLabQueueSnapshot(exId)
    }));
    
    return queuePos$;
  }
}
