const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
redisClient.connect().catch(() => {});

const PER_USER_LIMIT = parseInt(process.env.RATE_LIMIT_PER_USER || '2', 10); // per second
const GLOBAL_RPM = parseInt(process.env.GLOBAL_RPM || '15', 10);

async function perUserLimit(req, res, next) {
  try {
    const userId = (req.body && req.body.userId) || req.headers['x-user-id'] || req.ip;
    const userKey = `rl:u:${userId}`;
    const globalKey = `rl:global`;

    const userCount = await redisClient.incr(userKey);
    if (userCount === 1) {
      await redisClient.expire(userKey, 1);
    }
    if (userCount > PER_USER_LIMIT) {
      return res.status(429).json({ success: false, message: 'Too many requests (per-user limit)' });
    }

    const globalCount = await redisClient.incr(globalKey);
    if (globalCount === 1) {
      await redisClient.expire(globalKey, 60);
    }
    if (globalCount > GLOBAL_RPM) {
      return res.status(429).json({ success: false, message: 'Too many requests (global limit)' });
    }

    next();
  } catch (err) {
    console.error('Rate limit middleware error:', err.message);
    // Fail open on redis error
    next();
  }
}

module.exports = { perUserLimit };
