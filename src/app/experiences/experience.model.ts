import mongoose, { Schema } from "mongoose";
import { ActivityType, DifficultyType, CurrencyType, StatusType } from "../varTypes";

const ExperienceSchema: Schema = new Schema({
  guideId: { type: mongoose.Types.ObjectId, required: true, ref: "Guide" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  activity: { type: String, enum: Object.values(ActivityType), required: true },
  location: { type: String, required: true },
  difficulty: { type: String, enum: Object.values(DifficultyType), required: true },
  date: { type: Date, required: true },
  minGroupSize: { type: Number },
  maxGroupSize: { type: Number, required: true },
  pricePerPerson: { type: Number, required: true },
  currency: { type: String, enum: Object.values(CurrencyType), default: CurrencyType.MXN },
  photos: { type: [String], default: [] },
  status: { type: String, enum: Object.values(StatusType), default: StatusType.DRAFT },
  booked: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: () => new Date() },
  updateDate: { type: Date, default: () => new Date() },
});

const Experience = mongoose.model("Experience", ExperienceSchema);

export default Experience;