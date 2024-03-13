export interface LabQueueSnapshot {
    studentRequests: StudentRequest[];
}

export interface StudentRequest {
    userName: string;
    seatNr: number;
}