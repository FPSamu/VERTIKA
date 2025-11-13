import { ObjectId } from "mongoose";
import { UserType } from "../varTypes";

class User {
    _id?: ObjectId;
    name: string;
    email: string;
    password: string;
    roles: UserType[];
    emailVerified: boolean;
    dateOfBirth: Date;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string;
    verificationToken?: string;
    verificationExpires?: Date;

    constructor(
        name: string,
        email: string,
        password: string,
        dateOfBirth: Date,
        roles: UserType[] = ['customer']
    ) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.dateOfBirth = dateOfBirth;
        this.roles = roles;
        this.emailVerified = false;
        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
    }
}

export default User;