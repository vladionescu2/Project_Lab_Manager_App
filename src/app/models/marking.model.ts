export interface QueuePositions {
    positions: { [exerciseId: number]: number };
    seatNr: number;
    marked: number[];
    ready: number[];
}