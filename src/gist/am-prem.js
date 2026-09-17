const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ============================================
// KONFIGURASI
// ============================================
const BASE_URL = 'https://am-web-three.vercel.app';
const TIMEOUT = 30000;
const MAX_RETRY = 3;
const SESSION_FILE = path.resolve(__dirname, '.session.json');

// ============================================
// HEADERS
// ============================================
function buildHeaders(extra = {}) {
  return {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'content-type': 'application/json',
    'origin': BASE_URL,
    'referer': `${BASE_URL}/`,
    'priority': 'u=1, i',
    'sec-ch-ua': '"Not=A?Brand";v="99", "Android WebView";v="151", "Chromium";v="151"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-requested-with': 'com.unixshells.devbrowser',
    ...extra,
  };
}

// ============================================
// AXIOS CLIENT
// ============================================
const client = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: buildHeaders(),
  decompress: true,
  validateStatus: () => true,
  maxContentLength: 10 * 1024 * 1024,
  maxBodyLength: 10 * 1024 * 1024,
});

// ============================================
// UTIL
// ============================================
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function safeParse(data) {
  if (data && typeof data === 'object') return data;
  if (typeof data !== 'string') return { raw: data };
  try {
    return JSON.parse(data);
  } catch {
    return { raw: data };
  }
}

function saveSession(obj) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(obj, null, 2), 'utf-8');
}

function loadSession() {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

// ============================================
// CORE REQUEST + RETRY
// ============================================
async function requestWithRetry(method, url, body = null, attempt = 1) {
  const tag = `[${method.toUpperCase()} ${url}]`;
  try {
    console.log(`${tag} → attempt ${attempt}/${MAX_RETRY}`);
    if (body) console.log(`${tag} payload:`, JSON.stringify(body));

    const res = await client.request({ method, url, data: body });
    const parsed = safeParse(res.data);

    console.log(`${tag} ← ${res.status} ${res.statusText || ''}`);

    if (res.status < 200 || res.status >= 300) {
      return {
        ok: false,
        status: res.status,
        headers: res.headers,
        data: parsed,
        error: `HTTP ${res.status}`,
      };
    }

    return { ok: true, status: res.status, headers: res.headers, data: parsed };
  } catch (err) {
    let errMsg = err.message;
    if (err.code === 'ECONNABORTED') errMsg = `Timeout setelah ${TIMEOUT}ms`;
    if (err.code === 'ENOTFOUND') errMsg = 'DNS lookup gagal';
    if (err.code === 'ECONNRESET') errMsg = 'Koneksi di-reset server';

    console.error(`${tag} ✗ ${errMsg}`);

    const shouldRetry =
      attempt < MAX_RETRY &&
      (!err.response || err.response.status >= 500 || err.code === 'ECONNABORTED');

    if (shouldRetry) {
      const backoff = 1000 * Math.pow(2, attempt - 1);
      console.log(`${tag} ↻ retry dalam ${backoff}ms...`);
      await delay(backoff);
      return requestWithRetry(method, url, body, attempt + 1);
    }

    return {
      ok: false,
      status: err.response?.status ?? 0,
      headers: err.response?.headers ?? {},
      data: err.response?.data ? safeParse(err.response.data) : null,
      error: errMsg,
      code: err.code,
    };
  }
}

// ============================================
// API: SEND-LINK
// ============================================
async function sendLink(payload) {
  let body;
  if (typeof payload === 'string') body = { link: payload };
  else if (payload && typeof payload === 'object') body = payload;
  else throw new TypeError('sendLink: payload harus string atau object');

  return requestWithRetry('POST', '/api/send-link', body);
}

// ============================================
// API: VERIFY-LINK
// ============================================
async function verifyLink(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new TypeError('verifyLink: payload harus object');
  }
  return requestWithRetry('POST', '/api/verify-link', payload);
}

// ============================================
// DETEKSI TIPE ARGUMEN
// ============================================
function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

function isUrl(str) {
  return /^https?:\/\//i.test(str);
}

/**
 * Deteksi apakah argumen adalah oobCode.
 * oobCode Firebase biasanya panjang, campuran huruf/angka, kadang ada titik & strip.
 * Contoh: "AIzbSyC...xxx.yyy-zzz"
 */
function isOobCode(str) {
  if (isEmail(str) || isUrl(str)) return false;
  // minimal 20 char, hanya alfanumerik + . _ -
  return str.length >= 20 && /^[A-Za-z0-9._\-]+$/.test(str);
}

// ============================================
// STEP 1: LOGIN (kirim email → dapat oobCode)
// ============================================
async function loginWithEmail(email) {
  console.log('\n══════════════════════════════════════════════');
  console.log('📧 STEP 1 — LOGIN DENGAN EMAIL');
  console.log('🔗 Email :', email);
  console.log('══════════════════════════════════════════════');

  const res = await sendLink({ email });

  if (!res.ok) {
    console.error('\n❌ Gagal kirim email:', res.error);
    return { ok: false, step: 'send-link', res };
  }

  console.log('📥 Response:', JSON.stringify(res.data, null, 2));

  // Coba tarik oobCode dari berbagai kemungkinan struktur
  const oobCode =
    res.data?.oobCode ||
    res.data?.oobcode ||
    res.data?.code ||
    res.data?.data?.oobCode ||
    res.data?.data?.oobcode ||
    res.data?.data?.code ||
    null;

  // Simpan session
  saveSession({
    email,
    oobCode,
    lastSendResponse: res.data,
    savedAt: new Date().toISOString(),
  });

  if (!oobCode) {
    console.warn('\n⚠️  oobCode tidak ditemukan di response.');
    console.warn('    Cek isi response di atas, lalu sesuaikan field-nya.');
    console.warn('    Session tetap disimpan untuk dianalisis.');
    return { ok: true, oobCode: null, res };
  }

  console.log('\n✅ oobCode didapat:', oobCode);
  console.log('👉 Jalankan: node scraper.js ' + oobCode);
  return { ok: true, oobCode, res };
}

// ============================================
// STEP 2: VERIFY (pakai oobCode / link)
// ============================================
async function verifyWithCode(input) {
  console.log('\n══════════════════════════════════════════════');
  console.log('🔐 STEP 2 — VERIFIKASI');
  console.log('🔗 Input :', input);
  console.log('══════════════════════════════════════════════');

  const session = loadSession();
  if (session) {
    console.log('📂 Session ditemukan untuk email:', session.email);
  }

  // Bangun payload verify — coba beberapa nama field umum
  const payload = {
    oobCode: input,
    oobcode: input,
    code: input,
    link: input,
    email: session?.email || undefined,
    token: session?.oobCode || undefined,
  };

  // Bersihkan field undefined biar rapi
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  const res = await verifyLink(payload);

  if (!res.ok) {
    console.error('\n❌ Gagal verifikasi:', res.error);
    return { ok: false, step: 'verify-link', res };
  }

  console.log('📥 Response:', JSON.stringify(res.data, null, 2));

  // Simpan hasil verifikasi ke session
  saveSession({
    ...(session || {}),
    lastVerifyInput: input,
    lastVerifyResponse: res.data,
    verifiedAt: new Date().toISOString(),
  });

  console.log('\n✅ VERIFIKASI BERHASIL');
  return { ok: true, res };
}

// ============================================
// SIMPAN HASIL
// ============================================
function saveResult(result, filename = 'result.json') {
  const outPath = path.resolve(process.cwd(), filename);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`💾 Hasil disimpan: ${outPath}`);
  return outPath;
}

// ============================================
// MAIN CLI
// ============================================
async function main() {
  const arg = process.argv[2];

  if (!arg) {
    console.log(`
Penggunaan:
  node scraper.js <email>       → kirim email, dapat oobCode
  node scraper.js <oobCode>     → verifikasi pakai oobCode
  node scraper.js <url>         → verifikasi pakai link

Contoh:
  node scraper.js user@mail.com
  node scraper.js AIzbSyCxxx.yyy-zzz
  node scraper.js https://am-web-three.vercel.app/verify?oobCode=xxx
`);
    process.exit(0);
  }

  let result;

  try {
    if (isEmail(arg)) {
      // === STEP 1 ===
      result = await loginWithEmail(arg);
    } else if (isOobCode(arg)) {
      // === STEP 2 (oobCode) ===
      result = await verifyWithCode(arg);
    } else if (isUrl(arg)) {
      // === STEP 2 (URL) — ekstrak oobCode dari query string kalau ada
      let code = arg;
      try {
        const u = new URL(arg);
        code =
          u.searchParams.get('oobCode') ||
          u.searchParams.get('oobcode') ||
          u.searchParams.get('code') ||
          arg;
      } catch {
        /* biarkan pakai arg */
      }
      result = await verifyWithCode(code);
    } else {
      // Fallback: anggap oobCode walau pendek
      console.warn('⚠️  Format tidak dikenali, coba sebagai oobCode...');
      result = await verifyWithCode(arg);
    }

    saveResult(result);
    process.exit(result.ok ? 0 : 1);
  } catch (err) {
    console.error('\n💥 Fatal error:', err);
    process.exit(2);
  }
}

// ============================================
// EXPORT & ENTRY
// ============================================
if (require.main === module) {
  main();
}

module.exports = {
  sendLink,
  verifyLink,
  loginWithEmail,
  verifyWithCode,
  saveResult,
};
