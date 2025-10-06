import { ObjectId } from "mongoose";
import { UserType } from "../varTypes";

class User {
    _id?: ObjectId;
    name: string;
    email: string;
    roles: UserType[];
    emailVerified: boolean;
    dateOfBirth: Date;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        name: string,
        email: string,
        dateOfBirth: Date,
        roles: UserType[]
    ) {
        this.name = name;
        this.email = email;
        this.dateOfBirth = dateOfBirth;
        this.roles = roles;
        this.emailVerified = false;
        this.createdAt = new Date();
        this.updatedAt = this.createdAt;
    }
}

export default User;