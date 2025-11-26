import mongoose, { Schema } from "mongoose";

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "User", index: true },
  actorId: { type: mongoose.Types.ObjectId, ref: "User" }, // opcional, quien generó la acción
  type: { type: String, required: true },                  // ej. "newReservation", "review"
  title: { type: String },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed },                     // datos extra (reservationId, experienceId...)
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

// Index compuesto para consultas rápidas
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;