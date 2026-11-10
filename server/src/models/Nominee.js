import mongoose from 'mongoose';

const NomineeSchema = new mongoose.Schema(
  {
    discordUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const Nominee = mongoose.model('Nominee', NomineeSchema);
