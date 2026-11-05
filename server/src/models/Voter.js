import mongoose from 'mongoose';
import { VOTER_CATEGORIES, CODE_STATUS } from '../config/constants.js';

const VoterSchema = new mongoose.Schema(
  {
    discordUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      enum: VOTER_CATEGORIES,
      default: 'Regular Member',
      required: true
    },
    plaintextCode: {
      type: String,
      default: null,
      trim: true
    },
    codeHash: {
      type: String,
      sparse: true,
      unique: true,
      select: false,
      default: null
    },
    codeStatus: {
      type: String,
      enum: Object.values(CODE_STATUS),
      default: CODE_STATUS.ASSIGNED
    },
    hasVoted: {
      type: Boolean,
      default: false,
      index: true
    },
    votedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Helpful compound index
VoterSchema.index({ discordUsername: 1, hasVoted: 1 });

export const Voter = mongoose.model('Voter', VoterSchema);
