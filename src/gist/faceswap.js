/*
Name: FaceSwap
Base : https://aifaceswap.io
By : EpanD
Created : 01 June 2026
*/

import { Request, Response } from 'express';
import crypto from 'node:crypto';
import sharp from 'sharp';

const BASE = 'https://aifaceswap.io';
const RESULT_CDN = 'https://art-global.faceai.art/';

const FALLBACK_THEME_VERSION = 'iLRdqE03TMXl6tHCCoydK/V33MPiUenNmzQ1mTzdLNU=';
const FP = '817ddfb1-ea6c-4e07-b37d-3aa9281e4fb7';

const SECRET = '1H5tRtzsBkqXcaJ';
const APP_ID_V1 = 'aifaceswap_v1';

const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`;

const UA =
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36';

interface SessionState {
    themeVersion: string;
    cookie: string;
}

interface UploadResult {
    cdnUrl: string;
    fileName: string;
    nameNoExt: string;
    extra_data: Record<string, any>;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function md5(input: Buffer | string) {
    return crypto.createHash('md5').update(input).digest('hex');
}

function sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest();
}

function randomAlphaNum(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

function utcTimestampSeconds() {
    const d = new Date();
    const utc = new Date(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        d.getUTCHours(),
        d.getUTCMinutes(),
        d.getUTCSeconds()
    );
    return Math.floor(utc.getTime() / 1000);
}

function aesCbcEncryptBase64(text: string, keyText: string, ivText: string) {
    const key = Buffer.from(keyText, 'utf8');
    const iv = Buffer.from(ivText, 'utf8');
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    cipher.setAutoPadding(true);
    return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
}

function rsaEncryptBase64(text: string) {
    const encrypted = crypto.publicEncrypt(
        {
            key: RSA_PUBLIC_KEY,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(text, 'utf8')
    );
    return encrypted.toString('base64');
}

function signx() {
    const t = utcTimestampSeconds();
    const nonce = crypto.randomUUID();
    const aesSecret = randomAlphaNum(16);
    const secretKey = rsaEncryptBase64(aesSecret);
    const signText = `${APP_ID_V1}:${SECRET}:${t}:${nonce}:${secretKey}`;
    const sign = aesCbcEncryptBase64(signText, aesSecret, aesSecret);

    return { app_id: APP_ID_V1, t, nonce, sign, secret_key: secretKey, aesSecret };
}

function fpEncrypt(fp: string, aesSecret: string) {
    return aesCbcEncryptBase64(`${APP_ID_V1}:${fp}`, aesSecret, aesSecret);
}

async function encryptPayload(payload: object, themeVersion: string) {
    const text = JSON.stringify(payload);
    const key = sha256(themeVersion || FALLBACK_THEME_VERSION);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, tag]).toString('base64');
}

function mimeFromExt(ext: string) {
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    return `image/${ext}`;
}

function isValidUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function splitSetCookie(value: string | null) {
    if (!value) return [];
    return value.split(/,(?=\s*[^;,\s]+=)/g);
}

function updateCookieFromHeaders(headers: any, state: SessionState) {
    const setCookies =
        typeof headers.getSetCookie === 'function'
            ? headers.getSetCookie()
            : splitSetCookie(headers.get('set-cookie'));

    if (!setCookies.length) return;

    const jar: Record<string, string> = {};

    state.cookie
        .split(';')
        .map((v: string) => v.trim())
        .filter(Boolean)
        .forEach((v: string) => {
            const i = v.indexOf('=');
            if (i !== -1) jar[v.slice(0, i)] = v.slice(i + 1);
        });

    for (const item of setCookies) {
        const first = item.split(';')[0];
        const i = first.indexOf('=');
        if (i !== -1) jar[first.slice(0, i)] = first.slice(i + 1);
    }

    state.cookie = Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}

function baseHeaders(state: SessionState, extra: Record<string, string> = {}): Record<string, string> {
    return {
        'user-agent': UA,
        accept: 'application/json, text/plain, */*',
        origin: BASE,
        referer: `${BASE}/`,
        'sec-ch-ua-platform': `"Android"`,
        'sec-ch-ua': `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        'sec-ch-ua-mobile': '?1',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'theme-version': state.themeVersion || FALLBACK_THEME_VERSION,
        'x-code': String(Date.now()),
        ...(state.cookie ? { cookie: state.cookie } : {}),
        ...extra
    };
}

async function requestText(url: string, options: any, state: SessionState) {
    const res = await fetch(url, options);
    updateCookieFromHeaders(res.headers, state);
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
}

async function requestJson(url: string, options: any, state: SessionState) {
    const res = await fetch(url, options);
    updateCookieFromHeaders(res.headers, state);
    const text = await res.text();

    let json: any;
    try {
        json = text ? JSON.parse(text) : {};
    } catch {
        json = { raw: text };
    }

    return { ok: res.ok, status: res.status, json };
}

// ==================== Session ====================

async function initSession(state: SessionState) {
    const res = await requestText(
        `${BASE}/`,
        {
            method: 'GET',
            headers: {                                        // FIX: removed `as HeadersInit`
                'user-agent': UA,
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'sec-ch-ua': `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': `"Android"`,
                'upgrade-insecure-requests': '1',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                ...(state.cookie ? { cookie: state.cookie } : {})
            }
        },
        state
    );

    const match =
        res.text.match(/id=["']theme-version["'][^>]*data-kt-theme-version=["']([^"']+)["']/i) ||
        res.text.match(/data-kt-theme-version=["']([^"']+)["'][^>]*id=["']theme-version["']/i) ||
        res.text.match(/data-kt-theme-version=["']([^"']+)["']/i);

    state.themeVersion = match?.[1] || FALLBACK_THEME_VERSION;
}

async function fetchImageFromUrl(imageUrl: string) {
    const res = await fetch(imageUrl, {
        headers: {
            'user-agent': UA,
            accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch image: HTTP ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
        throw new Error(`URL is not an image. Content-Type: ${contentType}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    let ext = contentType.split('/')[1]?.split(';')[0]?.trim() || 'jpg';
    if (ext === 'jpeg') ext = 'jpg';

    return { buffer, ext, mime: mimeFromExt(ext) };
}

async function uploadImageFromUrl(imageUrl: string, state: SessionState): Promise<UploadResult> {
    const { buffer, ext, mime } = await fetchImageFromUrl(imageUrl);
    const fileName = `${md5(buffer)}.${ext}`;
    const nameNoExt = md5(buffer);

    const init = await requestJson(
        `${BASE}/api/upload_file`,
        {
            method: 'POST',
            headers: baseHeaders(state, {                     // FIX: removed `as HeadersInit`
                'content-type': 'application/json',
                priority: 'u=1, i'
            }),
            body: JSON.stringify({ file_name: fileName, type: 'image' })
        },
        state
    );

    if (!init.ok || init.json?.code !== 200 || !init.json?.data?.url) {
        throw new Error(`upload_file failed: ${JSON.stringify(init.json)}`);
    }

    const put = await fetch(init.json.data.url, {
        method: 'PUT',
        headers: {
            'content-type': mime,
            'x-oss-storage-class': 'Standard'
        },
        body: buffer
    });

    if (!put.ok) {
        throw new Error(`PUT OSS failed: HTTP ${put.status} ${await put.text()}`);
    }

    const cdnUrl = init.json.data.url
        .split('?')[0]
        .replace('https://yimeta-ai-face-swap.oss-us-west-1.aliyuncs.com/', '');

    return { cdnUrl, fileName, nameNoExt, extra_data: init.json.extra_data || {} };
}

function makeTaskNonce(sourceNameNoExt: string, faceNameNoExt: string) {
    return md5(`${sourceNameNoExt}:${faceNameNoExt}`);
}

async function generateFace(state: SessionState, source: UploadResult, face: UploadResult) {
    const sx = signx();
    const fp = FP;
    const fp1 = fpEncrypt(fp, sx.aesSecret);
    const nonce = makeTaskNonce(source.nameNoExt, face.nameNoExt);

    const payload = {
        source_image: source.cdnUrl,
        face_image: face.cdnUrl,
        type_1: source.extra_data?.type_1 || 0,
        type_2: face.extra_data?.type_2
    };

    const body = {
        request_type: 2,
        data: await encryptPayload(payload, state.themeVersion)
    };

    const res = await requestJson(
        `${BASE}/api/generate_face`,
        {
            method: 'POST',
            headers: baseHeaders(state, {                     // FIX: removed `as HeadersInit`
                'content-type': 'application/json',
                fp,
                fp1,
                'x-guide': sx.secret_key,
                'x-sign': sx.sign,
                nonce
            }),
            body: JSON.stringify(body)
        },
        state
    );

    return { response: res, nonce };
}

async function checkStatus(state: SessionState, taskId: string, nonce: string) {
    return await requestJson(
        `${BASE}/api/check_status`,
        {
            method: 'POST',
            headers: baseHeaders(state, {                     // FIX: removed `as HeadersInit`
                'content-type': 'application/json'
            }),
            body: JSON.stringify({ task_id: taskId, nonce })
        },
        state
    );
}

async function downloadAndConvertToJpg(resultUrl: string): Promise<Buffer> {
    const res = await fetch(resultUrl, {
        method: 'GET',
        headers: {
            'user-agent': UA,
            accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            referer: `${BASE}/`
        }
    });

    if (!res.ok) {
        throw new Error(`Download result failed: HTTP ${res.status}`);
    }

    const input = Buffer.from(await res.arrayBuffer());

    return await sharp(input)
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer();
}

async function handleSuccessResult(resultImage: string) {
    const resultUrl = `${RESULT_CDN}${resultImage}`;
    const buffer = await downloadAndConvertToJpg(resultUrl);
    return { buffer, resultUrl };
}

async function pollResult(state: SessionState, taskId: string, nonce: string) {
    for (let i = 0; i < 80; i++) {
        await sleep(i < 3 ? 1500 : 3000);

        const res = await checkStatus(state, taskId, nonce);
        const data = res.json?.data || {};
        const status = Number(data.status);

        if (res.json?.code !== 200) {
            throw new Error(`Check status failed: HTTP ${res.status}`);
        }

        if (status === -1) throw new Error('Task not found');
        if (status === 3) throw new Error('Generation failed on server');

        if (status === 2) {
            if (!data.result_image) throw new Error('Result image not found');
            return await handleSuccessResult(data.result_image);
        }
    }

    throw new Error('Timeout waiting for face swap result');
}

async function aiFaceSwap(sourceUrl: string, faceUrl: string) {
    const state: SessionState = { themeVersion: '', cookie: '' };

    await initSession(state);

    const [source, face] = await Promise.all([
        uploadImageFromUrl(sourceUrl, state),
        uploadImageFromUrl(faceUrl, state)
    ]);

    const gen = await generateFace(state, source, face);
    const json = gen.response.json;

    if (!gen.response.ok || json?.code !== 200) {
        throw new Error(`Generate face failed: HTTP ${gen.response.status}`);
    }

    if (json.data?.need_login) throw new Error('Login required');
    if (json.data?.protection_enable) throw new Error('Rate limited / protection enabled');

    if (json.data?.result_image) {
        return await handleSuccessResult(json.data.result_image);
    }

    const taskId = json.data?.task_id;
    if (!taskId) throw new Error('Task ID not found');

    return await pollResult(state, taskId, gen.nonce);
}

export default async function (req: Request, res: Response) {

    const sourceUrl = req.query.source as string;
    const faceUrl = req.query.face as string;
    const output = (req.query.output as string) || 'image';

    if (!sourceUrl) return res.json({ status: false, message: 'Source image URL required!' });
    if (!faceUrl) return res.json({ status: false, message: 'Face image URL required!' });
    if (!isValidUrl(sourceUrl)) return res.json({ status: false, message: 'Invalid source URL!' });
    if (!isValidUrl(faceUrl)) return res.json({ status: false, message: 'Invalid face URL!' });

    try {
        const result = await aiFaceSwap(sourceUrl, faceUrl);

        if (output === 'image') {
            res.set('Content-Type', 'image/jpeg');
            res.set('Content-Disposition', 'inline; filename="faceswap.jpg"');
            return res.send(result.buffer);
        }

        const base64 = result.buffer.toString('base64');
        const dataUri = `data:image/jpeg;base64,${base64}`;

        res.json({
            status: true,
            result: {
                source: sourceUrl,
                face: faceUrl,
                result_url: result.resultUrl,
                size: `${result.buffer.length} bytes`,
                base64: dataUri
            }
        });
    } catch (error: any) {
        res.json({
            status: false,
            message: error.message || 'An error occurred'
        });
    }
}