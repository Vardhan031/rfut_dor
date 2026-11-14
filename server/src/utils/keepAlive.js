import https from 'https';
import http from 'http';

/**
 * Self-ping keep-alive service
 * Free hosting tiers (such as Render) put inactive instances to sleep after 15 minutes of zero incoming traffic.
 * This service automatically pings the public endpoint every 12 minutes to keep the instance awake and warm.
 */
export const initKeepAlive = () => {
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

  if (!targetUrl) {
    console.log('[KeepAlive] No RENDER_EXTERNAL_URL or APP_URL detected. Internal self-ping standby.');
    return;
  }

  const cleanUrl = targetUrl.replace(/\/$/, '');
  const pingUrl = `${cleanUrl}/api/health`;
  const INTERVAL_MS = 12 * 60 * 1000; // 12 minutes (Render sleeps after 15 minutes)

  console.log(`[KeepAlive] Service active. Auto-pinging ${pingUrl} every 12 minutes.`);

  // Perform initial ping after 1 minute of startup
  setTimeout(() => {
    performPing(pingUrl);
  }, 60 * 1000);

  // Set recurring interval
  setInterval(() => {
    performPing(pingUrl);
  }, INTERVAL_MS);
};

const performPing = (pingUrl) => {
  try {
    const client = pingUrl.startsWith('https') ? https : http;
    const req = client.get(pingUrl, (res) => {
      // Consume response data to free up memory
      res.resume();
      console.log(`[KeepAlive] Ping successful (${res.statusCode}) at ${new Date().toISOString()}`);
    });

    req.on('error', (err) => {
      console.warn(`[KeepAlive] Ping warning: ${err.message}`);
    });

    // 15 second request timeout
    req.setTimeout(15000, () => {
      req.destroy();
      console.warn(`[KeepAlive] Ping timed out after 15s`);
    });
  } catch (error) {
    console.warn(`[KeepAlive] Error executing self-ping: ${error.message}`);
  }
};
