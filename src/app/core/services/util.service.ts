import { Injectable } from '@angular/core';
import { CourseUnit, CourseUnitSubmissions, LabTimes } from 'src/app/models/submissions.model';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }


  public stringToDate(obj: any) {
    const convertFields = (obj: any) => {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] == 'object') {
            convertFields(obj[key])
          }
          else {
            if (typeof obj[key] != 'boolean' && typeof obj[key] != 'number') {
              let date = new Date(obj[key]);
              if (!isNaN(date.getMonth())) {
                obj[key] = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
              }
            }
          }
        }
      }
    }

    const clonedObj = _.cloneDeep(obj);
    convertFields(clonedObj);
    return clonedObj;
  }


  public findUpcomingLab(labTimes: LabTimes[]): LabTimes {
    const today = Date.now();
    for (let times of labTimes) {
      if (today < times.end.getTime()) {
        return times;
      }
    }

    return labTimes[labTimes.length - 1];
  }

  public setAllUpcomingLabTimes(allUnits: CourseUnitSubmissions[]): CourseUnitSubmissions[] {
    const clonedObj = _.cloneDeep(allUnits);

    clonedObj.forEach(submission => {
      submission.courseUnit.upcomingLabTimes = this.findUpcomingLab(submission.courseUnit.labTimes);
    });

    return clonedObj;
  }

  public setAllUpcomingLabTimesStaff(allUnits: CourseUnit[]): CourseUnit[] {
    const clonedObj = _.cloneDeep(allUnits);

    clonedObj.forEach(unit => {
      unit.upcomingLabTimes = this.findUpcomingLab(unit.labTimes);
    });

    return clonedObj;
  }

}
