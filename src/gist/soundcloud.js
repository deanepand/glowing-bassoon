'use strict';

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

// ══════════════════════════════════════════════════════════════
// KONFIGURASI
// ══════════════════════════════════════════════════════════════
const CONFIG = {
  CLIENT_ID: 'Pb72ranhoyt6gw7hM7TkzUItXlMWSNSo',
  APP_VERSION: '1789689821',
  APP_LOCALE: 'en',
  ANON_USER_ID: '65026694',
  TIMEOUT: 25000,
  MAX_RETRY: 3,
  AUTH_URL: 'https://api-auth.soundcloud.com',
  API_V2_URL: 'https://api-v2.soundcloud.com',
  WEB_URL: 'https://soundcloud.com',
  USER_AGENT:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',
  DATADOME_CLIENTID:
    'ZZcr4jhXAhmW~kjJLqk~EgBLEOtmyebzz4UoJqqYyrAxKmqpD2_KK56QhObZ9BoM~8dZuRu~NYYSb7Au4nQCLunQk36PSLtqdjGjCV~~CPZsgzxM4ypcZMxBfekakZI6',
  WORKER: 'https://cf.elainaa.workers.dev',
};

// Flag dari CLI
const FLAGS = {
  viaWorker: process.argv.includes('--via-worker'),
  download: process.argv.includes('--download'),
  verbose: process.argv.includes('--verbose'),
};

// ══════════════════════════════════════════════════════════════
// SESSION STATE
// ══════════════════════════════════════════════════════════════
const state = {
  clientId: CONFIG.CLIENT_ID,
  datadomeClientId: CONFIG.DATADOME_CLIENTID,
  datadomeCookie:
    'zwtuHS_NDQwfOsIKefGS8Y0t85DymMGC9Yt9e_fq~uKr5id1PDRhyjJBTaC4X5Edyos7vujzJoIpWCcna190JxHly3m48Ptxu0SsoR9rJhJrsLz2bUtHEhuVlcdBY4Vb',
  lastRefresh: 0,
};

// ══════════════════════════════════════════════════════════════
// COOKIE JAR
// ══════════════════════════════════════════════════════════════
const jar = new CookieJar();

[
  'sc_tracking_anonymous_id=%22a279f825-ffbd-4eb5-adff-9acec73917bc%22',
  'sc_anonymous_id=607060-953326-517317-450837',
  'sc_theme=dark',
  'cookie_consent=1',
].forEach((c) => jar.setCookieSync(c, CONFIG.WEB_URL));

function syncDatadomeCookie() {
  try {
    jar.setCookieSync(`datadome=${state.datadomeCookie}`, CONFIG.WEB_URL);
  } catch (e) {
    /* ignore */
  }
}
syncDatadomeCookie();

// ══════════════════════════════════════════════════════════════
// HTTP CLIENTS
// ══════════════════════════════════════════════════════════════
function baseHeaders() {
  return {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,id;q=0.8',
    origin: CONFIG.WEB_URL,
    referer: `${CONFIG.WEB_URL}/`,
    'sec-ch-ua': '"Google Chrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': CONFIG.USER_AGENT,
    'x-datadome-clientid': state.datadomeClientId,
  };
}

function buildClient(baseURL, extraHeaders = {}) {
  return wrapper(
    axios.create({
      baseURL,
      timeout: CONFIG.TIMEOUT,
      jar,
      withCredentials: true,
      decompress: true,
      validateStatus: () => true,
      maxContentLength: 100 * 1024 * 1024,
      maxBodyLength: 100 * 1024 * 1024,
      maxRedirects: 5,
      headers: { ...baseHeaders(), ...extraHeaders },
    })
  );
}

const authClient = buildClient(CONFIG.AUTH_URL);
const apiClient = buildClient(CONFIG.API_V2_URL);
const webClient = buildClient(CONFIG.WEB_URL, {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'upgrade-insecure-requests': '1',
});

// Media client — no cookie, cross-site
const mediaClient = axios.create({
  timeout: CONFIG.TIMEOUT,
  decompress: true,
  validateStatus: () => true,
  maxRedirects: 5,
  headers: {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,id;q=0.8',
    origin: CONFIG.WEB_URL,
    referer: `${CONFIG.WEB_URL}/`,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': CONFIG.USER_AGENT,
  },
});

// Worker client — untuk bypass CORS/IP
const workerClient = axios.create({
  timeout: CONFIG.TIMEOUT,
  decompress: true,
  validateStatus: () => true,
  maxRedirects: 5,
  headers: {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    origin: CONFIG.WEB_URL,
    referer: `${CONFIG.WEB_URL}/`,
    'user-agent': CONFIG.USER_AGENT,
  },
});

// ══════════════════════════════════════════════════════════════
// UTIL
// ══════════════════════════════════════════════════════════════
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function randomHex(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

function safeParse(res) {
  const ct = res.headers?.['content-type'] || '';
  const raw = res.data;

  if (raw && typeof raw === 'object' && !Buffer.isBuffer(raw)) {
    return { type: 'json', data: raw };
  }
  if (typeof raw === 'string') {
    if (ct.includes('application/json')) {
      try {
        return { type: 'json', data: JSON.parse(raw) };
      } catch {
        return { type: 'text', data: raw };
      }
    }
    if (ct.includes('html')) return { type: 'html', data: raw };
    return { type: 'text', data: raw };
  }
  return { type: 'binary', data: raw };
}

async function withRetry(fn, label, attempt = 1) {
  try {
    return await fn();
  } catch (err) {
    const msg =
      err.code === 'ECONNABORTED'
        ? `Timeout ${CONFIG.TIMEOUT}ms`
        : err.code === 'ENOTFOUND'
        ? 'DNS gagal'
        : err.code === 'ECONNRESET'
        ? 'Koneksi reset'
        : err.message;

    console.error(`  [${label}] ✗ ${msg} (${attempt}/${CONFIG.MAX_RETRY})`);

    if (attempt < CONFIG.MAX_RETRY) {
      const backoff = 1000 * Math.pow(2, attempt - 1);
      await delay(backoff);
      return withRetry(fn, label, attempt + 1);
    }
    return { ok: false, error: msg, code: err.code, status: 0 };
  }
}

function log(...a) {
  if (FLAGS.verbose) console.log('   ', ...a);
}

// ══════════════════════════════════════════════════════════════
// WORKER PROXY
// ══════════════════════════════════════════════════════════════
function wrapWithWorker(targetUrl) {
  if (!FLAGS.viaWorker) return targetUrl;
  return `${CONFIG.WORKER}/${targetUrl}`;
}

// ══════════════════════════════════════════════════════════════
// AUTO-REFRESH DATADOME
// ══════════════════════════════════════════════════════════════
async function refreshDatadome() {
  console.log('  🔄 refresh datadome + client_id...');
  try {
    const res = await webClient.get('/');
    const html = typeof res.data === 'string' ? res.data : '';

    // Cari client_id baru
    const cidMatch = html.match(/client_id[=:"']([A-Za-z0-9]{20,})/);
    if (cidMatch && cidMatch[1] !== state.clientId) {
      state.clientId = cidMatch[1];
      console.log(`  🔄 client_id → ${state.clientId.slice(0, 16)}...`);
    }

    // Update datadome cookie dari jar
    const cookies = await jar.getCookies(CONFIG.WEB_URL);
    const dd = cookies.find((c) => c.key === 'datadome');
    if (dd && dd.value !== state.datadomeCookie) {
      state.datadomeCookie = dd.value;
      console.log('  🔄 datadome cookie updated');
    }

    state.lastRefresh = Date.now();
    syncDatadomeCookie();
    return true;
  } catch (err) {
    console.error(`  ❌ refresh gagal: ${err.message}`);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
// CORE API GET
// ══════════════════════════════════════════════════════════════
async function apiGet(pathname, params = {}, label = pathname) {
  const allParams = {
    client_id: state.clientId,
    app_version: CONFIG.APP_VERSION,
    app_locale: CONFIG.APP_LOCALE,
    ...params,
  };

  const qs = new URLSearchParams(allParams).toString();
  const targetUrl = `${CONFIG.API_V2_URL}${pathname}?${qs}`;
  const finalUrl = wrapWithWorker(targetUrl);

  const doRequest = async () => {
    const client = FLAGS.viaWorker ? workerClient : apiClient;
    const url = FLAGS.viaWorker ? finalUrl : pathname;

    const res = FLAGS.viaWorker
      ? await client.get(url)
      : await client.get(url, { params: allParams });

    const parsed = safeParse(res);
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      parsed,
      headers: res.headers,
    };
  };

  log(`GET ${pathname}${FLAGS.viaWorker ? ' (worker)' : ''}`);

  let result = await withRetry(doRequest, label);

  // Kalau 403, coba refresh datadome sekali
  if (!result.ok && result.status === 403) {
    console.warn(`  [${label}] ⚠ 403 — refresh datadome...`);
    await refreshDatadome();
    result = await withRetry(doRequest, label);
  }

  if (result.ok) {
    console.log(`  ✓ [${label}] ${result.status}`);
  } else {
    console.warn(`  ✗ [${label}] ${result.status || result.error}`);
  }

  return result;
}

// ══════════════════════════════════════════════════════════════
// ENDPOINTS
// ══════════════════════════════════════════════════════════════
async function getSession() {
  return withRetry(async () => {
    console.log('  → /oauth/session');
    const res = await authClient.get('/oauth/session', {
      params: { client_id: state.clientId },
    });
    const parsed = safeParse(res);
    console.log(`  ✓ /oauth/session ${res.status}`);
    return { ok: res.status < 300, status: res.status, data: parsed.data };
  }, 'oauth/session');
}

async function getMe() {
  return withRetry(async () => {
    console.log('  → /me');
    const res = await apiClient.post('/me', null, {
      params: { client_id: state.clientId },
    });
    const parsed = safeParse(res);
    console.log(`  ✓ /me ${res.status}`);
    return { ok: res.status < 300, status: res.status, data: parsed.data };
  }, 'me');
}

async function search(q, { limit = 20, offset = 0, facet = 'model' } = {}) {
  return apiGet(
    '/search',
    {
      q,
      query_urn: `soundcloud:search-autocomplete:${randomHex(32)}`,
      facet,
      user_id: '607060-953326-517317-450837',
      limit,
      offset,
      linked_partitioning: 1,
    },
    'search'
  );
}

async function getTrack(trackId) {
  return apiGet(`/tracks/${trackId}`, {}, `track/${trackId}`);
}

async function getTrackRelated(trackId, { limit = 10, offset = 0 } = {}) {
  return apiGet(
    `/tracks/${trackId}/related`,
    { anon_user_id: CONFIG.ANON_USER_ID, limit, offset, linked_partitioning: 1 },
    `related/${trackId}`
  );
}

async function getTrackAlbums(trackId, { limit = 10, offset = 0 } = {}) {
  return apiGet(
    `/tracks/${trackId}/albums`,
    { representation: 'mini', limit, offset, linked_partitioning: 1 },
    `albums/${trackId}`
  );
}

async function getTrackPlaylists(trackId, { limit = 10, offset = 0 } = {}) {
  return apiGet(
    `/tracks/${trackId}/playlists_without_albums`,
    { representation: 'mini', limit, offset, linked_partitioning: 1 },
    `playlists/${trackId}`
  );
}

async function getTrackLikers(trackId, { limit = 9, offset = 0 } = {}) {
  return apiGet(
    `/tracks/${trackId}/likers`,
    { limit, offset, linked_partitioning: 1 },
    `likers/${trackId}`
  );
}

async function getTrackReposters(trackId, { limit = 9, offset = 0 } = {}) {
  return apiGet(
    `/tracks/${trackId}/reposters`,
    { limit, offset, linked_partitioning: 1 },
    `reposters/${trackId}`
  );
}

async function getPlaylist(playlistId, representation = 'full') {
  return apiGet(
    `/playlists/${playlistId}`,
    { representation },
    `playlist/${playlistId}`
  );
}

// ══════════════════════════════════════════════════════════════
// STREAM RESOLVER
// ══════════════════════════════════════════════════════════════
async function resolveStream(trackData, protocol = 'progressive') {
  if (!trackData?.media?.transcodings) {
    return { ok: false, error: 'no transcodings' };
  }
  if (trackData.media.encrypted) {
    return { ok: false, error: 'DRM/encrypted' };
  }

  const pick = trackData.media.transcodings.find(
    (t) => t.format?.protocol === protocol
  );
  if (!pick) return { ok: false, error: `no ${protocol} transcoding` };

  return withRetry(async () => {
    log(`resolve ${protocol} → ${pick.url}`);
    const res = await apiClient.get(pick.url, {
      params: { client_id: state.clientId },
    });
    const parsed = safeParse(res);
    if (!parsed.data?.url) {
      return { ok: false, status: res.status, error: 'no url' };
    }
    return { ok: true, status: res.status, data: parsed.data };
  }, `stream/${protocol}`);
}

async function probeStream(url) {
  let res = await mediaClient.head(url);
  if (res.status < 400) {
    return { ok: true, status: res.status, headers: res.headers };
  }
  res = await mediaClient.get(url, { headers: { Range: 'bytes=0-0' } });
  return { ok: res.status < 400, status: res.status, headers: res.headers };
}

async function downloadInitSegment(url, out) {
  console.log(`  ↓ download init segment → ${out}`);
  return withRetry(async () => {
    const res = await mediaClient.get(url, { responseType: 'stream' });
    if (res.status >= 400) {
      return { ok: false, status: res.status };
    }
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(out);
      res.data.pipe(writer);
      writer.on('finish', () => {
        const size = fs.statSync(out).size;
        console.log(`  ✓ ${out} (${size} bytes)`);
        resolve({ ok: true, size, path: out });
      });
      writer.on('error', reject);
      res.data.on('error', reject);
    });
  }, 'download/init');
}

async function fetchHlsPlaylist(url) {
  return withRetry(async () => {
    const res = await mediaClient.get(url, { responseType: 'text' });
    if (res.status >= 400) return { ok: false, status: res.status };

    const manifest = typeof res.data === 'string' ? res.data : '';
    const lines = manifest.split('\n').map((l) => l.trim()).filter(Boolean);

    let initSegment = null;
    const mapLine = lines.find((l) => l.startsWith('#EXT-X-MAP'));
    if (mapLine) {
      const m = mapLine.match(/URI="([^"]+)"/);
      if (m) initSegment = m[1];
    }

    const segments = lines.filter((l) => !l.startsWith('#'));

    console.log(`  ✓ HLS: ${segments.length} segment`);
    return { ok: true, status: res.status, manifest, initSegment, segments };
  }, 'hls/playlist');
}

// ══════════════════════════════════════════════════════════════
// SCRAPE FULL TRACK
// ══════════════════════════════════════════════════════════════
async function scrapeTrackDetail(trackId, { downloadStream = false } = {}) {
  const started = Date.now();
  console.log('\n══════════════════════════════════════════════');
  console.log(`🎵 SCRAPE TRACK ${trackId}`);
  console.log(`   mode: ${FLAGS.viaWorker ? 'via-worker' : 'direct'}`);
  console.log('══════════════════════════════════════════════');

  const result = {
    trackId,
    startedAt: new Date().toISOString(),
    clientId: state.clientId,
    viaWorker: FLAGS.viaWorker,
    steps: {},
  };

  const runStep = async (name, fn) => {
    try {
      const r = await fn();
      result.steps[name] = {
        ok: r?.ok ?? false,
        status: r?.status ?? 0,
        error: r?.error,
      };
      return r;
    } catch (err) {
      result.steps[name] = { ok: false, error: err.message };
      console.error(`  ✗ step ${name}: ${err.message}`);
      return { ok: false, error: err.message };
    }
  };

  // 1–6: parallel-ish (sequential + delay 200ms)
  result.session = await runStep('session', () => getSession());
  await delay(200);

  result.me = await runStep('me', () => getMe());
  await delay(200);

  result.track = await runStep('track', () => getTrack(trackId));
  await delay(200);

  result.related = await runStep('related', () => getTrackRelated(trackId));
  await delay(200);

  result.albums = await runStep('albums', () => getTrackAlbums(trackId));
  await delay(200);

  result.playlists = await runStep('playlists', () => getTrackPlaylists(trackId));
  await delay(200);

  result.likers = await runStep('likers', () => getTrackLikers(trackId));
  await delay(200);

  result.reposters = await runStep('reposters', () => getTrackReposters(trackId));
  await delay(200);

  // 7: playlist detail
  const playlistId =
    result.playlists?.parsed?.data?.collection?.[0]?.id ||
    result.albums?.parsed?.data?.collection?.[0]?.id;

  if (playlistId) {
    result.playlistDetail = await runStep('playlistDetail', () =>
      getPlaylist(playlistId, 'full')
    );
    await delay(200);
  } else {
    result.steps.playlistDetail = { ok: false, error: 'no playlist/album' };
  }

  // 8: stream
  const trackData = result.track?.parsed?.data;
  if (trackData) {
    result.streamProgressive = await runStep('streamProgressive', () =>
      resolveStream(trackData, 'progressive')
    );
    await delay(200);

    result.streamHls = await runStep('streamHls', () =>
      resolveStream(trackData, 'hls')
    );
    await delay(200);

    if (result.streamHls?.ok && result.streamHls?.data?.url) {
      result.hlsManifest = await runStep('hlsManifest', () =>
        fetchHlsPlaylist(result.streamHls.data.url)
      );
      if (result.hlsManifest?.manifest) delete result.hlsManifest.manifest;
    }

    if (
      downloadStream &&
      result.streamProgressive?.ok &&
      result.streamProgressive?.data?.url
    ) {
      result.initDownload = await runStep('initDownload', () =>
        downloadInitSegment(
          result.streamProgressive.data.url,
          `init-${trackId}.mp4`
        )
      );
    }
  } else {
    result.steps.stream = { ok: false, error: 'no track data' };
  }

  result.elapsedMs = Date.now() - started;

  const okSteps = Object.values(result.steps).filter((s) => s.ok).length;
  const total = Object.keys(result.steps).length;

  console.log('\n══════════════════════════════════════════════');
  console.log(`✅ SELESAI ${result.elapsedMs}ms — ${okSteps}/${total} steps OK`);
  console.log('══════════════════════════════════════════════');

  return result;
}

// ══════════════════════════════════════════════════════════════
// RINGKASAN
// ══════════════════════════════════════════════════════════════
function summarize(r) {
  if (!r) return null;
  const t = r.track?.parsed?.data;
  return {
    track: t
      ? {
          id: t.id,
          title: t.title,
          user: t.user?.username,
          duration_ms: t.duration,
          playback_count: t.playback_count,
          likes_count: t.likes_count,
          permalink: t.permalink_url,
        }
      : null,
    related: (r.related?.parsed?.data?.collection || []).slice(0, 5).map((x) => ({
      id: x.id,
      title: x.title,
      user: x.user?.username,
    })),
    likers: (r.likers?.parsed?.data?.collection || []).slice(0, 5).map((u) => u.username),
    reposters: (r.reposters?.parsed?.data?.collection || [])
      .slice(0, 5)
      .map((u) => u.username),
    playlists: (r.playlists?.parsed?.data?.collection || []).slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      track_count: p.track_count,
    })),
    streams: {
      progressive: r.streamProgressive?.data?.url
        ? r.streamProgressive.data.url.slice(0, 120) + '...'
        : null,
      hls: r.streamHls?.data?.url
        ? r.streamHls.data.url.slice(0, 120) + '...'
        : null,
      hls_init: r.hlsManifest?.initSegment || null,
      hls_segments: r.hlsManifest?.segments?.length ?? 0,
    },
    steps: r.steps,
    elapsedMs: r.elapsedMs,
  };
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════
async function main() {
  const trackId = process.argv[2];

  if (!trackId || !/^\d+$/.test(trackId)) {
    console.log(`
Penggunaan:
  node soundcloud-full.js <trackId> [opsi]

Opsi:
  --download     Download init.mp4 segment
  --via-worker   Route request via CF Worker (${CONFIG.WORKER})
  --verbose      Tampilkan log detail

Contoh:
  node soundcloud-full.js 1909478012
  node soundcloud-full.js 1909478012 --download
  node soundcloud-full.js 1909478012 --via-worker --download
`);
    process.exit(1);
  }

  try {
    const result = await scrapeTrackDetail(trackId, {
      downloadStream: FLAGS.download,
    });

    // Simpan full
    const fullPath = path.resolve(process.cwd(), `soundcloud-track-${trackId}.json`);
    fs.writeFileSync(fullPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n💾 Full   : ${fullPath}`);

    // Simpan ringkasan
    const summary = summarize(result);
    const sumPath = path.resolve(process.cwd(), `soundcloud-summary-${trackId}.json`);
    fs.writeFileSync(sumPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`💾 Summary: ${sumPath}`);

    console.log('\n📊 RINGKASAN:');
    console.log(JSON.stringify(summary, null, 2));

    process.exit(result.track?.ok ? 0 : 2);
  } catch (err) {
    console.error('\n💥 Fatal:', err);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {
  CONFIG,
  FLAGS,
  state,
  getSession,
  getMe,
  search,
  getTrack,
  getTrackRelated,
  getTrackAlbums,
  getTrackPlaylists,
  getTrackLikers,
  getTrackReposters,
  getPlaylist,
  resolveStream,
  probeStream,
  downloadInitSegment,
  fetchHlsPlaylist,
  refreshDatadome,
  scrapeTrackDetail,
  summarize,
};
