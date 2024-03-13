import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, Observer, Subject, Subscriber, Subscription, timer } from 'rxjs';
import { catchError, delay, delayWhen, retryWhen, switchAll, tap } from 'rxjs/operators';
import { QueuePositions } from 'src/app/models/marking.model';
import { AuthenticationService } from './auth.service';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
const EventSource = NativeEventSource || EventSourcePolyfill;

@Injectable({
  providedIn: 'root'
})
export class QueuePositionService {
  private labManagerUrl: string = 'lab-manager'
  private subscription: Subscription;

  private messages$: Subject<QueuePositions> = new Subject();


  constructor(private authService: AuthenticationService, private http: HttpClient) {
    this.authService.queuePosService = this;
  }

  private createQueuePositionObservable(): Observable<QueuePositions> {
    console.log("Creating new queue pos observable");
    const userName = this.authService.getUser().userName;
  
    const createNewEventSource = (observer: Subscriber<QueuePositions>) => {
      const eventSource = new EventSource(`${this.labManagerUrl}/queue-pos/${userName}`);
  
      eventSource.addEventListener('new-pos', event => { console.log("New queue pos event!"); observer.next(JSON.parse(event.data)) });
      eventSource.onmessage = event => { console.log("New event!"); observer.next(JSON.parse(event.data)) };
      eventSource.onerror = event => { observer.error(event) };
  
      return () => {
        console.log("Stopping EventSource");
        eventSource.close();
      };
    }

    return new Observable(createNewEventSource).pipe(catchError(e => {console.log('Error on queue stream', e); return this.getQueuePositionStream()}));
  }

  public getQueuePositionStream(): Observable<QueuePositions> {
    if (!this.subscription) {
      this.subscription = this.createQueuePositionObservable().subscribe(queuePos => {
        this.messages$.next(queuePos);
      });
    }

    return this.messages$;
  }

  public stopQueueListener(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
