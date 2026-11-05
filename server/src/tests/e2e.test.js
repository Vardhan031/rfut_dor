import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from '../utils/seed.js';

const PORT = 5099; // Isolated test port

async function runE2E() {
  console.log('\n======================================================');
  console.log('   RFUT DOR — FULL END-TO-END HTTP API TEST SUITE    ');
  console.log('======================================================\n');

  // 1. Seed database with clean test dataset
  const seedResult = await seedDatabase();
  const availableCodeObj = seedResult.voterCodesList.find((c) => !c.hasVoted);
  console.log(`[E2E] Testing with voter: ${availableCodeObj.discordUsername} (Code: ${availableCodeObj.plaintextCode})`);

  // 2. Start HTTP server
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  const baseUrl = `http://localhost:${PORT}/api`;
  console.log(`[E2E] Test server active on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` [PASS] ${message}`);
      passed++;
    } else {
      console.error(` [FAIL] ${message}`);
      failed++;
    }
  }

  async function apiRequest(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  try {
    // 1. Health check
    const health = await apiRequest('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Health check returns 200 OK');

    // 2. Admin Login
    const adminLogin = await apiRequest('/admin/login', {
      method: 'POST',
      body: { username: 'admin', password: 'AdminPassword123!' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login succeeds and returns JWT');
    const adminToken = adminLogin.data.token;

    // 3. Voter Code Verification - Invalid Code
    const badCode = await apiRequest('/voter/verify-code', {
      method: 'POST',
      body: { code: 'RFUT-0000-0000' }
    });
    assert(badCode.status === 400 && badCode.data.success === false, 'Invalid voting code returns 400 rejection');

    // 4. Voter Code Verification - Valid Code
    const validCode = await apiRequest('/voter/verify-code', {
      method: 'POST',
      body: { code: availableCodeObj.plaintextCode }
    });
    assert(validCode.status === 200 && validCode.data.token, 'Valid voting code unlocks session');
    assert(validCode.data.voter.discordUsername === availableCodeObj.discordUsername, 'Session belongs to correct Discord handle');
    const voterToken = validCode.data.token;

    // 5. Voter Profile
    const profile = await apiRequest('/voter/me', {
      headers: { Authorization: `Bearer ${voterToken}` }
    });
    assert(profile.status === 200 && profile.data.data.hasVoted === false, 'Voter profile indicates voting is pending');

    // 6. Public Nominee Privacy
    const nominees = await apiRequest('/voter/nominees', {
      headers: { Authorization: `Bearer ${voterToken}` }
    });
    assert(nominees.status === 200 && nominees.data.data.length >= 10, 'Voter receives active candidates');
    assert(nominees.data.data[0].totalPoints === undefined, 'No points or vote counts exposed in voter candidate list');

    const nomineeList = nominees.data.data;

    // 7. Security: Voter attempts to access admin endpoint
    const forbiddenResults = await apiRequest('/admin/results', {
      headers: { Authorization: `Bearer ${voterToken}` }
    });
    assert(forbiddenResults.status === 403, 'Voter is forbidden (403) from accessing admin private results');

    // 8. Ballot validation: < 10 nominees
    const invalidBallotShort = await apiRequest('/voter/ballot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${voterToken}` },
      body: {
        rankings: nomineeList.slice(0, 5).map((n, i) => ({ nomineeId: n._id, rank: i + 1 }))
      }
    });
    assert(invalidBallotShort.status === 400, 'Submitting fewer than 10 nominees is rejected with 400');

    // 9. Ballot validation: duplicate nominee
    const dupList = [];
    for (let i = 0; i < 10; i++) {
      dupList.push({ nomineeId: i === 1 ? nomineeList[0]._id : nomineeList[i]._id, rank: i + 1 });
    }
    const invalidBallotDup = await apiRequest('/voter/ballot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${voterToken}` },
      body: { rankings: dupList }
    });
    assert(invalidBallotDup.status === 400, 'Submitting duplicate nominee in Top 10 is rejected with 400');

    // 10. Valid Ballot Submission
    const validRankings = nomineeList.slice(0, 10).map((n, i) => ({
      nomineeId: n._id,
      rank: i + 1
    }));
    const submitRes = await apiRequest('/voter/ballot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${voterToken}` },
      body: { rankings: validRankings }
    });
    assert(submitRes.status === 201 && submitRes.data.success === true, 'Valid ballot submitted successfully with 201 Created');
    assert(submitRes.data.receipt.totalPointsDistributed === 67, 'Receipt verifies 67 total points distributed');

    // 11. Re-Vote Prevention (ballot already recorded)
    const reSubmit = await apiRequest('/voter/ballot', {
      method: 'POST',
      headers: { Authorization: `Bearer ${voterToken}` },
      body: { rankings: validRankings }
    });
    assert(reSubmit.status === 403, 'Second ballot submission with same voter is strictly forbidden (403)');

    // 12. Code reuse prevention (used code cannot verify)
    const reuseCode = await apiRequest('/voter/verify-code', {
      method: 'POST',
      body: { code: availableCodeObj.plaintextCode }
    });
    assert(reuseCode.status === 403 && reuseCode.data.code === 'CODE_ALREADY_USED', 'Reusing spent code is strictly blocked (403 CODE_ALREADY_USED)');

    // 13. Admin Results & Leaderboard Calculation
    const resultsRes = await apiRequest('/admin/results', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(resultsRes.status === 200, 'Admin can access results');
    assert(resultsRes.data.data.leaderboard.length > 0, 'Leaderboard is calculated');
    const leader = resultsRes.data.data.leaderboard[0];
    assert(leader.totalPoints > 0, `Leader "${leader.displayName}" has ${leader.totalPoints} points`);

    // 14. Admin Voting Gate Toggle (Close Voting)
    const closeControl = await apiRequest('/admin/controls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isVotingOpen: false }
    });
    assert(closeControl.status === 200 && closeControl.data.data.isVotingOpen === false, 'Admin successfully closed voting');

    // Another unused voter attempts to verify when closed
    const anotherVoter = seedResult.voterCodesList.find((c) => c.discordUsername !== availableCodeObj.discordUsername && !c.hasVoted);
    const verifyWhileClosed = await apiRequest('/voter/verify-code', {
      method: 'POST',
      body: { code: anotherVoter.plaintextCode }
    });
    assert(verifyWhileClosed.status === 403 && verifyWhileClosed.data.code === 'VOTING_CLOSED', 'Voter verification rejected when voting is closed (403 VOTING_CLOSED)');

    // Reopen voting
    await apiRequest('/admin/controls', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isVotingOpen: true }
    });

    console.log(`\n======================================================`);
    console.log(`   E2E RESULTS: ${passed} PASSED, ${failed} FAILED    `);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error('[E2E Error]', err);
    failed++;
  } finally {
    server.close();
    await disconnectDB();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }
}

runE2E();
