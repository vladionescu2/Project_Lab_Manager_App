import { TestBed } from '@angular/core/testing';

import { SubmissionsService } from './submissions.service';

describe('SubmissionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SubmissionsService = TestBed.get(SubmissionsService);
    expect(service).toBeTruthy();
  });
});
