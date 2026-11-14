#!/usr/bin/env node

/**
 * Quick keep-alive ping script
 * Usage: node scripts/ping.js [url]
 * Example: node scripts/ping.js https://rfut-dor.onrender.com
 */

const https = require('https');
const http = require('http');

const target = process.argv[2] || process.env.LIVE_SITE_URL || 'https://rfut-dor.onrender.com';
const cleanUrl = target.replace(/\/$/, '');
const endpoint = `${cleanUrl}/api/health`;

console.log(`[Ping] Target: ${endpoint} at ${new Date().toISOString()}`);

const client = endpoint.startsWith('https') ? https : http;

const req = client.get(endpoint, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log(`[Ping] Status: ${res.statusCode}`);
    console.log(`[Ping] Response:`, data);
  });
});

req.on('error', (err) => {
  console.error(`[Ping] Failed:`, err.message);
  process.exit(1);
});

req.setTimeout(30000, () => {
  console.error(`[Ping] Request timed out after 30s.`);
  req.destroy();
  process.exit(1);
});
