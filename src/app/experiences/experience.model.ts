import { ObjectId } from 'mongoose';
import { ActivityType, DifficultyType, CurrencyType, StatusType } from '../varTypes';
class Experience {
    _id?: ObjectId;
    guideId: ObjectId;
    title: string;
    activity: ActivityType;
    location: string;
    difficulty: DifficultyType;
    date: Date;
    minGroupSize?: number;
    maxGroupSize: number;
    pricePerPerson: number;
    currency:  CurrencyType;
    photos: string[];
    status: StatusType;
    booked: boolean;
    rating: number;
    createdAt: Date;
    updateDate: Date;

    constructor(
        guideId: ObjectId,
        title: string,
        activity: ActivityType,
        location: string,
        difficulty: DifficultyType,
        date: Date,
        maxGroupSize: number,
        pricePerPerson: number,
        currency: CurrencyType = 'MXN',
        photos: string[] = [],
        minGroupSize?: number,
        status: StatusType = 'draft'
    ) {
        this.guideId = guideId;
        this.title = title;
        this.activity = activity;
        this.location = location;
        this.difficulty = difficulty;
        this.date = date;
        this.minGroupSize = minGroupSize;
        this.maxGroupSize = maxGroupSize;
        this.pricePerPerson = pricePerPerson;
        this.currency = currency;
        this.photos = photos;
        this.status = status;
        this.booked = false;
        this.rating = 0;
        this.createdAt = new Date;
        this.updateDate = this.createdAt;
    }
}

export default Experience;