import { LabExercise, LabTimes } from "./submissions.model";

export interface NewCourseUnitRequest {
    unitCode: string;
    staffMembers: string[];
    labDates: LabTimes[];
}

export interface NewLabFormatRequest {
    forUnitCode: string;
    repoNameFormat: string;
    labExercises: LabExercise[];
}