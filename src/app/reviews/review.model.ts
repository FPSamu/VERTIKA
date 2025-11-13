import mongoose, { Schema } from "mongoose";

const ReviewSchema: Schema = new Schema({
  reservationId: { type: mongoose.Types.ObjectId, required: true, ref: "Reservation" },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  experienceId: { type: mongoose.Types.ObjectId, required: true, ref: "Experience" },
  guideId: { type: mongoose.Types.ObjectId, required: true, ref: "Guide" },
  experienceRating: { type: Number, min: 0, max: 5 },
  guideRating: { type: Number, min: 0, max: 5 },
  comment: { type: String },
  photos: { type: [String], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

// Actualizar updatedAt antes de guardar
ReviewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Review = mongoose.model("Review", ReviewSchema);

export default Review;