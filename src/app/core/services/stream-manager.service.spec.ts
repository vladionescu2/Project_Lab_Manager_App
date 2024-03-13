import { TestBed } from '@angular/core/testing';

import { StreamManagerService } from './stream-manager.service';

describe('StreamManagerService', () => {
  let service: StreamManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
