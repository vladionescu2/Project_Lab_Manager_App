import { TestBed } from '@angular/core/testing';

import { QueuePositionService } from './queue-position.service';

describe('QueuePositionService', () => {
  let service: QueuePositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueuePositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
