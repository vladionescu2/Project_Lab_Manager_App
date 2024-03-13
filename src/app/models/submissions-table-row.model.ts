export interface ExerciseRow {
    id: string;
    unit: string;
    exercise: string;
    deadline: Date;
    repoName?: string;
    date?: Date;
    late?: boolean;
    queuePos?: number;
    exerciseId?: number;
    marked?: boolean;
    ready?: boolean;
}