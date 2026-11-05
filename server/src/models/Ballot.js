import mongoose from 'mongoose';

const RankingItemSchema = new mongoose.Schema(
  {
    nomineeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nominee',
      required: true
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    points: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const BallotSchema = new mongoose.Schema(
  {
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voter',
      required: true,
      unique: true // Strictly enforce one ballot per voter at MongoDB level
    },
    rankings: {
      type: [RankingItemSchema],
      required: true,
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length === 10;
        },
        message: 'A ballot must contain exactly 10 rankings.'
      }
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Ballot = mongoose.model('Ballot', BallotSchema);
