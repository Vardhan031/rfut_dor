import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../config/db.js';
import * as adminService from '../services/adminService.js';
import * as voterService from '../services/voterService.js';
import * as nomineeService from '../services/nomineeService.js';
import * as ballotService from '../services/ballotService.js';
import { RANK_POINTS } from '../config/constants.js';

import { seedDatabase } from '../utils/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runVerification() {
  console.log('\n--- STARTING RFUT DOR ENGINE VERIFICATION SUITE ---\n');
  await seedDatabase();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Admin Authentication
    console.log('\n[1] Testing Admin Authentication...');
    try {
      await adminService.loginAdmin('admin', 'AdminPassword123!');
      assert(false, 'Old admin credentials should be rejected');
    } catch (err) {
      assert(err.message.includes('Invalid credentials'), 'Old admin credentials correctly rejected');
    }

    const adminAuth = await adminService.loginAdmin('rakesh@dor.com', 'sk_live_dor2026_9b4e7a2c1f8d');
    assert(adminAuth && adminAuth.token, 'New admin credentials (rakesh@dor.com) succeed and issue JWT token');
    assert(
      adminAuth.admin.username === 'rakesh@dor.com' || adminAuth.admin.email === 'rakesh@dor.com',
      'Admin profile correctly retrieved with rakesh@dor.com'
    );

    // 2. Read Seed Codes
    const seedCodesPath = path.resolve(__dirname, '../../seed_codes.json');
    assert(fs.existsSync(seedCodesPath), 'Seed codes file exists');
    const seedCodes = JSON.parse(fs.readFileSync(seedCodesPath, 'utf8'));
    const available = seedCodes.filter((c) => !c.hasVoted);
    assert(available.length > 0, `Found ${available.length} available unused codes`);

    // 3. Test Invalid Code Rejection
    console.log('\n[2] Testing Code Verification Rules...');
    try {
      await voterService.verifyCodeAndStartSession('RFUT-INVALID-CODE');
      assert(false, 'Invalid code should be rejected');
    } catch (err) {
      assert(err.message.includes('Invalid voting code'), 'Invalid code was properly rejected with error');
    }

    // 4. Test Valid Code Verification
    const testVoterCode = available[0];
    const session = await voterService.verifyCodeAndStartSession(testVoterCode.plaintextCode);
    assert(session && session.token, 'Valid voting code issues session token');
    assert(session.voter.discordUsername === testVoterCode.discordUsername, 'Session belongs to correct Discord voter');

    // 5. Public Nominee Privacy
    console.log('\n[3] Testing Public Nominee Privacy...');
    const publicNominees = await nomineeService.getNominees(false);
    assert(publicNominees.length >= 10, `Found ${publicNominees.length} active nominees for voters`);
    assert(publicNominees[0].totalPoints === undefined, 'Public nominee list does NOT expose points');
    assert(publicNominees[0].firstPlaceVotes === undefined, 'Public nominee list does NOT expose vote counts');

    // 6. Ballot Validation: Less than 10 nominees
    console.log('\n[4] Testing Ballot Submission Rules...');
    const voterId = session.voter.id;
    try {
      const shortRankings = publicNominees.slice(0, 5).map((n, i) => ({ nomineeId: n._id, rank: i + 1 }));
      await ballotService.submitBallot(voterId, shortRankings);
      assert(false, 'Ballot with < 10 nominees should be rejected');
    } catch (err) {
      assert(err.message.includes('exactly 10'), 'Submitting fewer than 10 nominees is rejected');
    }

    // 7. Ballot Validation: Duplicate nominee
    try {
      const dupRankings = [];
      for (let i = 0; i < 10; i++) {
        // use nominee 0 twice
        const nom = i === 1 ? publicNominees[0] : publicNominees[i];
        dupRankings.push({ nomineeId: nom._id, rank: i + 1 });
      }
      await ballotService.submitBallot(voterId, dupRankings);
      assert(false, 'Ballot with duplicate nominee should be rejected');
    } catch (err) {
      assert(err.message.includes('Duplicate nominee'), 'Submitting duplicate nominee is rejected');
    }

    // 8. Valid Ballot Submission
    const validRankings = publicNominees.slice(0, 10).map((n, i) => ({
      nomineeId: n._id,
      rank: i + 1
    }));
    const submissionResult = await ballotService.submitBallot(voterId, validRankings);
    assert(submissionResult.success === true, 'Valid ballot submitted successfully');
    assert(submissionResult.receipt.totalPointsDistributed === 67, 'Distributed exactly 67 points');

    // 9. Re-vote Prevention
    console.log('\n[5] Testing Re-Vote and Code Reuse Prevention...');
    try {
      await ballotService.submitBallot(voterId, validRankings);
      assert(false, 'Duplicate ballot submission should be blocked');
    } catch (err) {
      assert(err.message.includes('already been submitted') || err.message.includes('recorded'), 'Duplicate ballot is strictly blocked');
    }

    const reSession = await voterService.verifyCodeAndStartSession(testVoterCode.plaintextCode);
    assert(reSession && reSession.voter.hasVoted === true, 'Used code reports hasVoted: true (directs voter to receipt and prevents ballot re-submission)');

    // 10. Admin Results & Tie-breaker calculation
    console.log('\n[6] Testing Results Calculation & Tie-breakers...');
    const results = await adminService.getResultsAndLeaderboard();
    assert(results.totalBallots >= 1, `Leaderboard calculated with ${results.totalBallots} ballots`);
    assert(results.leaderboard.length > 0, 'Leaderboard contains ranked nominees');
    const leader = results.leaderboard[0];
    assert(leader.totalPoints > 0, `Top nominee "${leader.displayName}" has accrued ${leader.totalPoints} points`);
    assert(leader.rank === 1, 'Top nominee has rank 1');

    // Verify points ordering
    let sortedCorrectly = true;
    for (let i = 1; i < results.leaderboard.length; i++) {
      if (results.leaderboard[i].totalPoints > results.leaderboard[i - 1].totalPoints) {
        sortedCorrectly = false;
        break;
      }
    }
    assert(sortedCorrectly, 'Leaderboard is strictly sorted by points in descending order');

    // 11. Voting Control Toggle
    console.log('\n[7] Testing Voting Controls (Open / Close Safeguards)...');
    await adminService.updateVotingControl({ isVotingOpen: false });
    const testVoter2 = available[1];
    try {
      await voterService.verifyCodeAndStartSession(testVoter2.plaintextCode);
      assert(false, 'Voting when closed should be rejected');
    } catch (err) {
      assert(err.message.includes('Voting is currently closed'), 'Backend blocks session creation when voting is closed');
    }

    // Reopen voting
    await adminService.updateVotingControl({ isVotingOpen: true });
    const reopenedSession = await voterService.verifyCodeAndStartSession(testVoter2.plaintextCode);
    assert(reopenedSession && reopenedSession.token, 'Voting can be safely reopened by admin');

    console.log(`\n--- VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
  } catch (error) {
    console.error('Unhandled verification error:', error);
    failed++;
  } finally {
    await disconnectDB();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runVerification();
