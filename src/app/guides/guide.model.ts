import { ObjectId } from 'mongoose';

class Guides {
    _id?: ObjectId;
    userId: ObjectId;
    bio: string;
    certifications?: string[];
    experienceYears: number;
    specialties?: string[];
    languages: string[];
    verified: boolean;
    rating: number;
    createdAt: Date;
    updatedAt: Date

    constructor(
        userId: ObjectId,
        bio: string,
        experienceYears: number,
        languages: string[],
        certifications: string[] = [],
        specialties: string[] = []
    ) {
        this.userId = userId;
        this.bio = bio;
        this.certifications = certifications;
        this.experienceYears = experienceYears;
        this.specialties = specialties;
        this.languages = languages;
        this.verified = false;
        this.rating = 0;
        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
    }
}

export default Guides;