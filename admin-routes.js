/**
 * ═══════════════════════════════════════════════════════════════════
 *  VBS Admin Panel — Backend Routes (admin-routes.js)
 *  Add this file to your existing Render/Express backend
 *  Integration: require('./admin-routes')(app) in your server.js
 * ═══════════════════════════════════════════════════════════════════
 *
 *  SETUP INSTRUCTIONS:
 *  1. npm install bcryptjs express-session express-rate-limit
 *  2. Set env vars:
 *       ADMIN_USERNAME=vbsadmin
 *       ADMIN_PASSWORD_HASH=<bcrypt hash of your password>
 *       SESSION_SECRET=<random 64-char string>
 *  3. To generate password hash:
 *       node -e "const b=require('bcryptjs'); console.log(b.hashSync('YourPassword123!', 12))"
 */

const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// ── In-memory stores (use Redis or DB for production multi-instance) ──
const adminLoginLogs = [];
const MAX_LOGS = 200;

function logEvent(type, data) {
  adminLoginLogs.unshift({ type, ...data, time: new Date().toISOString() });
  if (adminLoginLogs.length > MAX_LOGS) adminLoginLogs.pop();
}

// ── Rate limiter: max 10 login attempts per 15 min per IP ──
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Session auth middleware ──
function requireAdminSession(req, res, next) {
  if (req.session && req.session.adminUser && req.session.adminExpires > Date.now()) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized. Please log in.' });
}

// ── Mask a string value ──
function maskValue(val) {
  if (!val) return null;
  if (val.length <= 8) return '••••••••';
  return val.slice(0, 6) + '••••' + val.slice(-3);
}

// ── Get env var list (never exposes full values) ──
function getSafeEnvStatus() {
  const keys = [
    'GEMINI_API_KEY', 'OPENAI_API_KEY', 'DEEPSEEK_API_KEY',
    'MONGODB_URI', 'SUPABASE_KEY', 'CLOUDINARY_API_KEY',
    'FIREBASE_API_KEY', 'RENDER_API_KEY', 'NODE_ENV', 'PORT'
  ];
  return keys.map(k => ({
    key: k,
    set: !!process.env[k],
    masked: process.env[k] ? maskValue(process.env[k]) : '(not set)',
  }));
}

module.exports = function registerAdminRoutes(app, sessionMiddleware) {
  // ── Apply session middleware (pass your existing session config) ──
  // If you already have sessions configured, skip this line.
  // Example: app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { secure: true, httpOnly: true, maxAge: 3600000 } }));

  // ── POST /api/admin/login ──────────────────────────────────────────
  app.post('/api/admin/login', loginLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Missing credentials.' });
      }

      const storedHash = process.env.ADMIN_PASSWORD_HASH;
      const storedUser = (process.env.ADMIN_USERNAME || 'vbsadmin').toLowerCase();

      if (!storedHash) {
        console.error('[Admin] ADMIN_PASSWORD_HASH env var not set!');
        return res.status(500).json({ success: false, error: 'Server configuration error.' });
      }

      const userMatch = username.toLowerCase() === storedUser;
      const pwMatch = userMatch && await bcrypt.compare(password, storedHash);

      if (pwMatch) {
        // Create session
        req.session.adminUser = username;
        req.session.adminExpires = Date.now() + 3600000; // 1 hour
        req.session.loginTime = Date.now();

        logEvent('login', { user: username, ip, method: 'backend' });
        console.log(`[Admin] Successful login: ${username} from ${ip}`);

        return res.json({ success: true, message: 'Authenticated', expiresIn: 3600 });
      } else {
        logEvent('failed', { user: username, ip });
        console.warn(`[Admin] Failed login attempt: ${username} from ${ip}`);
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
      }
    } catch (err) {
      console.error('[Admin] Login error:', err);
      return res.status(500).json({ success: false, error: 'Server error.' });
    }
  });

  // ── POST /api/admin/logout ────────────────────────────────────────
  app.post('/api/admin/logout', requireAdminSession, (req, res) => {
    req.session.destroy();
    return res.json({ success: true });
  });

  // ── GET /api/admin/status ──────────────────────────────────────────
  // Session check — called by dashboard on load
  app.get('/api/admin/status', requireAdminSession, (req, res) => {
    res.json({
      success: true,
      user: req.session.adminUser,
      loginTime: req.session.loginTime,
      expiresAt: req.session.adminExpires,
    });
  });

  // ── GET /api/admin/env ────────────────────────────────────────────
  // Returns masked env variable status — never full values
  app.get('/api/admin/env', requireAdminSession, (req, res) => {
    res.json({ success: true, env: getSafeEnvStatus() });
  });

  // ── GET /api/admin/logs ───────────────────────────────────────────
  app.get('/api/admin/logs', requireAdminSession, (req, res) => {
    res.json({ success: true, logs: adminLoginLogs.slice(0, 50) });
  });

  // ── GET /api/admin/server-stats ───────────────────────────────────
  app.get('/api/admin/server-stats', requireAdminSession, (req, res) => {
    const mem = process.memoryUsage();
    const upSec = Math.floor(process.uptime());
    res.json({
      success: true,
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        rss: Math.round(mem.rss / 1024 / 1024),
      },
      uptime: upSec,
      uptimeFormatted: `${Math.floor(upSec / 3600)}h ${Math.floor((upSec % 3600) / 60)}m`,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
      platform: process.platform,
    });
  });

  // ── GET /health (public endpoint for uptime monitoring) ───────────
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  console.log('[Admin] Admin routes registered: /api/admin/{login,logout,status,env,logs,server-stats}');
};

/*
─────────────────────────────────────────────────────────────
  HOW TO INTEGRATE INTO YOUR EXISTING server.js / index.js
─────────────────────────────────────────────────────────────

  // In your server.js, AFTER your existing middleware setup:

  const session = require('express-session');
  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true on HTTPS
      httpOnly: true,
      maxAge: 3600000 // 1 hour
    }
  }));

  // Add CORS for admin panel origin
  const cors = require('cors');
  app.use(cors({
    origin: ['https://vbscomputersystem.in'],
    credentials: true
  }));

  // Register admin routes
  require('./admin-routes')(app);

─────────────────────────────────────────────────────────────
  RENDER ENV VARS TO SET
─────────────────────────────────────────────────────────────
  ADMIN_USERNAME=vbsadmin
  ADMIN_PASSWORD_HASH=<bcrypt hash>
  SESSION_SECRET=<64-char random string>

  Generate password hash:
  node -e "const b=require('bcryptjs'); console.log(b.hashSync('YourNewPassword@2025', 12))"
─────────────────────────────────────────────────────────────
*/
