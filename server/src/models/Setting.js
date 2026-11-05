import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    isVotingOpen: {
      type: Boolean,
      default: true
    },
    resultsAnnounced: {
      type: Boolean,
      default: false
    },
    updatedBy: {
      type: String,
      default: 'system'
    }
  },
  {
    timestamps: true
  }
);

export const Setting = mongoose.model('Setting', SettingSchema);
