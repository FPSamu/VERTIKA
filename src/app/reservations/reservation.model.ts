import { ObjectId } from 'mongoose';
import { StatusType } from '../varTypes';

class Reservation {
    _id?: ObjectId;
    experienceId: ObjectId;
    userId: ObjectId;
    seats: number;
    status: StatusType;
    total: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        experienceId: ObjectId,
        userId: ObjectId,
        seats: number,
        total: number,
        status: StatusType = 'pending'
    ) {
        this.experienceId = experienceId;
        this.userId = userId;
        this.seats = seats;
        this.total = total;
        this.status = status;
        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
    }
}

export default Reservation;