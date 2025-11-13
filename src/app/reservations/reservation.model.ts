import mongoose, { Schema } from "mongoose";
import { StatusType } from "../varTypes";

const ReservationSchema: Schema = new Schema({
  experienceId: { type: mongoose.Types.ObjectId, required: true, ref: "Experience" },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  seats: { type: Number, required: true },
  status: { type: String, enum: Object.values(StatusType), default: "pending" },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

const Reservation = mongoose.model("Reservation", ReservationSchema);

export default Reservation;