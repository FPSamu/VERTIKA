import mongoose, { Schema } from 'mongoose';

const GuideSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    bio: { type: String, required: true },
    certifications: { type: [String], default: [] },
    experienceYears: { type: Number, required: true },
    specialties: { type: [String], default: [] },
    languages: { type: [String], required: true },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
});

// Middleware para actualizar updatedAt automaticamente
GuideSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Guide', GuideSchema);