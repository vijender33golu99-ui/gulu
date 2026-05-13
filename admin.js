// ============================================================
//  VBS Admin Dashboard — admin.js
//  Polls /api/admin/stats + /api/admin/logs + /api/health
//  every 10 seconds. All data is REAL from backend.
// ============================================================

'use strict';

// ── Config ───────────────────────────────────────────────────
const HEALTH_ENDPOINT    = '/api/health';
const STATS_ENDPOINT     = '/api/admin/stats';
const LOGS_ENDPOINT      = '/api/admin/logs';
const REFRESH_INTERVAL_MS = 10000;

// ── Provider display config ──────────────────────────────────
const PROVIDERS = [
  { key: 'nvidia',     icon: '🚀', label: 'NVIDIA Build',  model: 'Llama / Mistral Vision' },
  { key: 'deepseek',   icon: '🧠', label: 'DeepSeek V3',   model: 'deepseek-chat' },
  { key: 'gemini',     icon: '✨', label: 'Google Gemini', model: 'gemini-2.0-flash' },
  { key: 'groq',       icon: '⚡', label: 'Groq',          model: 'llama-3.3-70b / llama-4-scout' },
  { key: 'openrouter', icon: '🌐', label: 'OpenRouter',    model: 'deepseek-chat-v3 (free)' },
  { key: 'mongodb',    icon: '🍃', label: 'MongoDB Cache', model: 'Atlas / Compass' },
];

// ── State: provider online status from /api/health ──────────
const providerOnline = {
  nvidia: null, deepseek: null, gemini: null,
  groq: null, openrouter: null, mongodb: null,
};

// ── Helpers ──────────────────────────────────────────────────
function el(id)           { return document.getElementById(id); }
function setText(id, text) { const e = el(id); if (e) e.textContent = text; }
function setInner(id, html){ const e = el(id); if (e) e.innerHTML  = html;  }
function escapeHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Render: Stat Cards ───────────────────────────────────────
function renderStats(stats) {
  setText('stat-total-requests', Number(stats.totalRequests || 0).toLocaleString());
  setText('stat-cache-hits',     Number(stats.cacheHits     || 0).toLocaleString());
  setText('stat-cache-misses',   Number(stats.cacheMisses   || 0).toLocaleString());
  setText('stat-ocr-requests',   Number(stats.ocrRequests   || 0).toLocaleString());

  const total = (stats.cacheHits || 0) + (stats.cacheMisses || 0);
  const rate  = total > 0 ? Math.round((stats.cacheHits / total) * 100) : 0;
  const sub = el('stat-cache-hits-sub');
  if (sub) sub.textContent = `${rate}% hit rate`;

  // Active provider = provider with most requests
  const p = stats.providers || {};
  const topProvider = Object.entries(p)
    .sort((a, b) => b[1] - a[1])
    .find(([, count]) => count > 0);

  const labelMap = {
    nvidia: '🚀 NVIDIA', deepseek: '🧠 DeepSeek', gemini: '✨ Gemini',
    groq: '⚡ Groq', openrouter: '🌐 OpenRouter',
  };
  setText('stat-active-provider', topProvider ? (labelMap[topProvider[0]] || topProvider[0]) : '—');
}

// ── Render: Provider List ────────────────────────────────────
function renderProviders(stats) {
  const list = el('provider-list');
  if (!list) return;

  const providerCounts = (stats && stats.providers) ? stats.providers : {};

  list.innerHTML = PROVIDERS.map(p => {
    const online = providerOnline[p.key];
    const count  = providerCounts[p.key] ?? (p.key === 'mongodb' ? '—' : 0);
    const badgeClass = online === true ? 'online' : online === false ? 'offline' : 'unknown';
    const badgeLabel = online === true ? 'ONLINE'  : online === false ? 'OFFLINE' : 'CHECKING…';
    const reqLabel   = p.key === 'mongodb' ? 'cache DB' : `${count} req`;

    return `
    <div class="provider-row" id="prow-${p.key}">
      <div class="provider-left">
        <span class="provider-icon">${p.icon}</span>
        <div>
          <div class="provider-name">${p.label}</div>
          <div class="provider-model">${p.model}</div>
        </div>
      </div>
      <div class="provider-right">
        <span class="provider-count" id="pcount-${p.key}" title="Successful responses this session">${reqLabel}</span>
        <span class="status-badge ${badgeClass}" id="pbadge-${p.key}">
          <span class="badge-dot"></span>${badgeLabel}
        </span>
      </div>
    </div>`;
  }).join('');
}

// ── Render: Server Health ────────────────────────────────────
function renderHealth(data) {
  if (!data) {
    setInner('health-grid',
      '<div class="health-item"><div class="health-key">Status</div>' +
      '<div class="health-val error">❌ Unreachable</div></div>'
    );
    setText('health-timestamp', 'Server unreachable — retrying…');
    return;
  }

  const mongoOk  = data.mongodb === 'connected';
  const serverOk = data.status  === 'ok';

  // Update online state for providers
  providerOnline.nvidia     = !!data.nvidia_key;
  providerOnline.deepseek   = !!data.deepseek_key;
  providerOnline.gemini     = data.gemini_keys > 0;
  providerOnline.groq       = data.groq_keys   > 0;
  providerOnline.openrouter = !!data.openrouter_key;
  providerOnline.mongodb    = mongoOk;

  const items = [
    { key: 'Status',      val: serverOk ? '✅ OK'          : '❌ ERROR',       cls: serverOk     ? 'ok'   : 'error' },
    { key: 'NVIDIA Key',  val: data.nvidia_key     ? '✅ Loaded' : '❌ Missing', cls: data.nvidia_key     ? 'ok'   : 'error' },
    { key: 'DeepSeek',    val: data.deepseek_key   ? '✅ Loaded' : '❌ Missing', cls: data.deepseek_key   ? 'ok'   : 'error' },
    { key: 'Gemini Keys', val: `${data.gemini_keys ?? '?'} key${data.gemini_keys !== 1 ? 's' : ''}`,
                          cls: (data.gemini_keys  > 0) ? 'ok'   : 'warn' },
    { key: 'Groq Keys',   val: `${data.groq_keys  ?? '?'} key${data.groq_keys  !== 1 ? 's' : ''}`,
                          cls: (data.groq_keys    > 0) ? 'ok'   : 'warn' },
    { key: 'OpenRouter',  val: data.openrouter_key ? '✅ Loaded' : '❌ Missing', cls: data.openrouter_key ? 'ok'   : 'error' },
    { key: 'MongoDB',     val: mongoOk ? '✅ Connected' : '❌ Disconnected',    cls: mongoOk             ? 'ok'   : 'error' },
  ];

  setInner('health-grid', items.map(i =>
    `<div class="health-item">
      <div class="health-key">${i.key}</div>
      <div class="health-val ${i.cls}">${i.val}</div>
    </div>`
  ).join(''));

  if (data.timestamp) {
    setText('health-timestamp',
      'Last checked: ' + new Date(data.timestamp).toLocaleTimeString('en-IN', { hour12: true })
    );
  }
}

// ── Render: Activity Log ─────────────────────────────────────
function renderLog(logs) {
  const box = el('activity-log');
  if (!box) return;

  if (!logs || logs.length === 0) {
    box.innerHTML = '<div class="log-empty">No activity yet — waiting for student requests…</div>';
    return;
  }

  box.innerHTML = logs.map(e => {
    const timeStr = e.time
      ? new Date(e.time).toLocaleTimeString('en-IN', { hour12: false })
      : '??:??:??';
    return `
    <div class="log-entry">
      <span class="log-time">${timeStr}</span>
      <span class="log-tag ${escapeHtml(e.tag)}">${escapeHtml(e.tag).toUpperCase()}</span>
      <span class="log-msg">${escapeHtml(e.msg)}</span>
    </div>`;
  }).join('');
}

// ── Clear log button handler (exposed globally) ──────────────
function clearLog() {
  const box = el('activity-log');
  if (box) box.innerHTML = '<div class="log-empty">Log cleared (local view only).</div>';
}

// ── Fetch /api/admin/stats ───────────────────────────────────
async function fetchStats() {
  try {
    const res   = await fetch(STATS_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const stats = await res.json();
    renderStats(stats);
    renderProviders(stats);
  } catch (err) {
    console.warn('[Admin] fetchStats failed:', err.message);
    // Don't wipe UI on transient error
  }
}

// ── Fetch /api/admin/logs ────────────────────────────────────
async function fetchLogs() {
  try {
    const res  = await fetch(LOGS_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderLog(data.logs || []);
  } catch (err) {
    console.warn('[Admin] fetchLogs failed:', err.message);
  }
}

// ── Fetch /api/health ────────────────────────────────────────
let consecutiveFails = 0;
async function fetchHealth() {
  try {
    const res  = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    consecutiveFails = 0;
    renderHealth(data);
  } catch (err) {
    consecutiveFails++;
    console.warn(`[Admin] fetchHealth failed (${consecutiveFails}x):`, err.message);
    renderHealth(null);
  }
}

// ── Full refresh (all 3 endpoints) ───────────────────────────
async function fullRefresh() {
  await Promise.allSettled([fetchHealth(), fetchStats(), fetchLogs()]);
  updateCountdown(REFRESH_INTERVAL_MS / 1000);
}

// ── Manual refresh (button) ──────────────────────────────────
function manualRefresh() {
  const btn = el('refresh-btn');
  if (btn) {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 700);
  }
  fullRefresh();
}

// ── Countdown ────────────────────────────────────────────────
let countdownVal = REFRESH_INTERVAL_MS / 1000;

function updateCountdown(val) { countdownVal = val; }

function tickCountdown() {
  countdownVal = Math.max(0, countdownVal - 1);
  const cdEl = el('countdown');
  if (cdEl) cdEl.textContent = `Next refresh in ${countdownVal}s`;
}

// ── Init ─────────────────────────────────────────────────────
function init() {
  // Show loading shimmer state for providers until data arrives
  renderProviders({});
  renderLog([]);

  // Immediate first load
  fullRefresh();

  // Auto-refresh all endpoints every 10s
  setInterval(fullRefresh, REFRESH_INTERVAL_MS);

  // Countdown ticker
  setInterval(tickCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', init);
