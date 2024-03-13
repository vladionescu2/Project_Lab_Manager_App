export interface CourseUnitSubmissions {
    courseUnit: CourseUnit;
    studentRepos: StudentRepo[];
}

export interface StudentRepo {
    repoName: string;
    lab: LabFormat;
    submissions: Submission[];
}

export interface LabFormat {
    repoNamingSchema: string;
    labExercises: LabExercise[];
}

export interface CourseUnit {
    unitCode: string; 
    labTimes: LabTimes[];
    staffMembers: string[];
    labFormats: LabFormat[];
    upcomingLabTimes?: LabTimes;
}

export interface LabExercise {
    exerciseId?: number;
    exerciseName: string;
    deadline: Date;
}

export interface LabTimes {
    id?: number;
    start: Date;
    end: Date;
}

export interface Submission {
    commitId: string;
    submissionTag: string;
    timeStamp: Date;
    labExercise: LabExercise;
    late: boolean;
    marked: boolean;
}