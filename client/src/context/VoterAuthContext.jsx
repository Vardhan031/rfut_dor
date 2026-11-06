import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const VoterAuthContext = createContext();

export const VoterAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('rfut_voter_token') || null);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNominees, setSelectedNominees] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // Load voter profile on token change or initial load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setVoter(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/voter/me');
        if (res.data?.success) {
          setVoter(res.data.data);
          if (res.data.data.hasVoted) {
            try {
              const ballotRes = await api.get('/voter/ballot');
              if (ballotRes.data?.success && ballotRes.data.data?.rankings) {
                const loaded = ballotRes.data.data.rankings
                  .sort((a, b) => a.rank - b.rank)
                  .map((r) => ({
                    ...(r.nomineeId || {}),
                    rank: r.rank,
                    points: r.points
                  }));
                setRankings(loaded);
              }
            } catch (bErr) {
              // Ignore if no ballot found yet
            }
          }
        }
      } catch (err) {
        console.error('Failed to load voter session:', err);
        localStorage.removeItem('rfut_voter_token');
        setToken(null);
        setVoter(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Unlock voting using code
  const unlockWithCode = async (code) => {
    try {
      const res = await api.post('/voter/verify-code', { code });
      if (res.data?.success) {
        localStorage.setItem('rfut_voter_token', res.data.token);
        setToken(res.data.token);
        setVoter(res.data.voter);
        setSelectedNominees([]);
        setRankings([]);
        toast.success(`Access granted! Welcome, ${res.data.voter.discordUsername}`);
        return { success: true, voter: res.data.voter };
      }
      return { success: false, message: res.data?.message || 'Verification failed.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to verify voting code.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Toggle nominee selection (max 10)
  // NOTE: rankings is intentionally NOT updated here — it is only set
  // by the RankingPage once the voter explicitly orders their nominees.
  const toggleSelectNominee = (nominee) => {
    const exists = selectedNominees.some((n) => n._id === nominee._id);
    if (exists) {
      const filtered = selectedNominees.filter((n) => n._id !== nominee._id);
      setSelectedNominees(filtered);
      // Clear rankings too so stale order doesn't bleed through
      setRankings([]);
    } else {
      if (selectedNominees.length >= 10) {
        toast.warning('You have already selected 10 nominees. Remove one first to add another.');
        return;
      }
      setSelectedNominees((prev) => [...prev, nominee]);
      // Do NOT auto-populate rankings — voter must rank manually
    }
  };

  const isNomineeSelected = (nomineeId) => {
    return selectedNominees.some((n) => n._id === nomineeId);
  };

  const getNomineeRank = (nomineeId) => {
    const index = rankings.findIndex((n) => n._id === nomineeId);
    return index !== -1 ? index + 1 : null;
  };

  // Submit official ballot
  const submitOfficialBallot = async () => {
    if (rankings.length !== 10) {
      toast.error('You must rank exactly 10 nominees before submitting.');
      return { success: false, message: 'Must rank 10 nominees.' };
    }

    try {
      const payload = {
        rankings: rankings.map((nom, idx) => ({
          nomineeId: nom._id,
          rank: idx + 1
        }))
      };

      const res = await api.post('/voter/ballot', payload);
      if (res.data?.success) {
        setSubmittedReceipt(res.data.receipt);
        setVoter((prev) => (prev ? { ...prev, hasVoted: true } : prev));
        toast.success('Ballot officially recorded and locked!');
        return { success: true, receipt: res.data.receipt };
      }
      return { success: false, message: res.data?.message || 'Failed to submit ballot.' };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit ballot.';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logoutVoter = () => {
    localStorage.removeItem('rfut_voter_token');
    setToken(null);
    setVoter(null);
    setSelectedNominees([]);
    setRankings([]);
    setSubmittedReceipt(null);
  };

  return (
    <VoterAuthContext.Provider
      value={{
        token,
        voter,
        loading,
        selectedNominees,
        setSelectedNominees,
        rankings,
        setRankings,
        submittedReceipt,
        setSubmittedReceipt,
        unlockWithCode,
        toggleSelectNominee,
        isNomineeSelected,
        getNomineeRank,
        submitOfficialBallot,
        logoutVoter
      }}
    >
      {children}
    </VoterAuthContext.Provider>
  );
};

export const useVoterAuth = () => useContext(VoterAuthContext);
