import { ObjectId } from "mongoose";

class Review {
    _id?: ObjectId;
    reservationId: ObjectId;
    userId: ObjectId;
    experienceId: ObjectId;
    guideId: ObjectId;
    experienceRating?: number;
    guideRating?: number;
    comment?: string;
    photos?: string[];
    createdAt: Date;
    updatedAt: Date;

    constructor(
        reservationId: ObjectId,
        userId: ObjectId,
        experienceId: ObjectId,
        guideId: ObjectId,
        rating?: number,
        guideRating?: number,
        comment?: string,
        photos: string[] = []
    ) {
        this.reservationId = reservationId;
        this.userId = userId;
        this.experienceId = experienceId;
        this.guideId = guideId;
        this.experienceRating = rating;
        this.guideRating = guideRating;
        this.comment = comment;
        this.photos = photos;
        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
    }
}

export default Review;