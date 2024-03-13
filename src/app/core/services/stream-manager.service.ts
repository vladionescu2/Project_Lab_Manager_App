import { Injectable } from '@angular/core';
import { QueuePositionService } from './queue-position.service';
import { StaffService } from './staff.service';

@Injectable({
  providedIn: 'root'
})
export class StreamManagerService {

  constructor(private queuePos: QueuePositionService, private staff: StaffService) { }

  public turnOffStreams():void {
    this.queuePos.stopQueueListener();
  }
}
