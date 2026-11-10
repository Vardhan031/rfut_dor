import { Nominee } from '../models/Nominee.js';
import { Ballot } from '../models/Ballot.js';

export const getNominees = async (forAdmin = false) => {
  if (forAdmin) {
    const nominees = await Nominee.find().sort({ createdAt: 1 }).lean();
    return nominees;
  }
  // Public voter list: ONLY active nominees, preserved in exact ceremony order
  return Nominee.find({ isActive: true })
    .select('displayName discordUsername imageUrl description')
    .sort({ createdAt: 1 })
    .lean();
};

export const createNominee = async ({ displayName, discordUsername, imageUrl, description, isActive = true }) => {
  if (!displayName || !discordUsername) {
    throw new Error('Display name and Discord username are required.');
  }

  const existing = await Nominee.findOne({ discordUsername: discordUsername.trim() });
  if (existing) {
    throw new Error(`A nominee with Discord username "${discordUsername}" already exists.`);
  }

  const nominee = await Nominee.create({
    displayName: displayName.trim(),
    discordUsername: discordUsername.trim(),
    imageUrl: imageUrl ? imageUrl.trim() : '',
    description: description ? description.trim() : '',
    isActive: Boolean(isActive)
  });

  return nominee;
};

export const updateNominee = async (id, data) => {
  const nominee = await Nominee.findById(id);
  if (!nominee) {
    throw new Error('Nominee not found.');
  }

  if (data.displayName) nominee.displayName = data.displayName.trim();
  if (data.discordUsername) nominee.discordUsername = data.discordUsername.trim();
  if (data.imageUrl) nominee.imageUrl = data.imageUrl.trim();
  if (typeof data.description === 'string') nominee.description = data.description.trim();
  if (typeof data.isActive === 'boolean') nominee.isActive = data.isActive;

  await nominee.save();
  return nominee;
};

export const deleteNominee = async (id) => {
  const nominee = await Nominee.findById(id);
  if (!nominee) {
    throw new Error('Nominee not found.');
  }

  // Check if nominee exists in any submitted ballot
  const referencedInBallot = await Ballot.findOne({ 'rankings.nomineeId': id });
  if (referencedInBallot) {
    throw new Error('Cannot delete this nominee because they are included in one or more submitted ballots. You can deactivate them instead.');
  }

  await Nominee.findByIdAndDelete(id);
  return { success: true, message: `Nominee "${nominee.displayName}" has been deleted.` };
};

export const toggleNomineeActive = async (id) => {
  const nominee = await Nominee.findById(id);
  if (!nominee) {
    throw new Error('Nominee not found.');
  }
  nominee.isActive = !nominee.isActive;
  await nominee.save();
  return nominee;
};

export const deleteAllNominees = async () => {
  const result = await Nominee.deleteMany({});
  return {
    success: true,
    message: `All nominees deleted (${result.deletedCount} nominees removed).`,
    deletedCount: result.deletedCount
  };
};
