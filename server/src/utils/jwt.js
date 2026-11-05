import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rfut_dor_fallback_jwt_secret_esports';

export const signAdminToken = (payload) => {
  return jwt.sign(
    {
      id: payload._id || payload.id,
      username: payload.username,
      role: 'admin'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const signVoterToken = (voter) => {
  return jwt.sign(
    {
      voterId: voter._id || voter.id,
      discordUsername: voter.discordUsername,
      category: voter.category,
      role: 'voter'
    },
    JWT_SECRET,
    { expiresIn: '2h' } // Short-lived secure session for voting
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
