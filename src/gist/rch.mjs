import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://react-channelwa.vercel.app/api';
const API_KEY = process.env.API_KEY || 'your-secret-key';

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36';

function generateDeviceId() {
    return crypto.randomBytes(16).toString('hex');
}

async function reactToChannel(postUrl, emoji = '🔥') {
    const deviceId = generateDeviceId();
    const deviceName = `Device-${Math.floor(Math.random() * 9000) + 1000}`;

    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': UA,
        'Origin': 'https://react-channelwa.vercel.app',
        'Referer': 'https://react-channelwa.vercel.app/'
    };

    // Step 1: Register Device
    const regRes = await axios.post(`${BASE_URL}/register-device`, {
        deviceId,
        name: deviceName
    }, { headers });

    const deviceKey = regRes.data?.deviceKey;
    if (!deviceKey) throw new Error('Gagal register device');

    // Step 2: Inject Reaction
    const injRes = await axios.post(`${BASE_URL}/inject`, {
        deviceKey,
        url: postUrl,
        emojis: emoji
    }, { headers });

    return {
        deviceId,
        deviceKey,
        deviceName,
        result: injRes.data
    };
}

// =============================================
// Ambil API Key dari Header atau Query
// =============================================
function extractApiKey(req) {
    const headerKey = req.headers['x-api-key'];
    if (headerKey) return headerKey;

    const queryKey = req.query?.apikey;
    if (queryKey) return queryKey;

    return undefined;
}

// =============================================
// Main Handler
// =============================================
export default async function handler(req, res) {
    // 1. Ambil API Key
    const apikey = extractApiKey(req);

    // 2. Validasi API Key
    if (!apikey) {
        return res.status(401).json({
            status: false,
            message: 'API Key diperlukan! Kirim via header "x-api-key" atau query "apikey".'
        });
    }

    if (apikey !== API_KEY) {
        return res.status(403).json({
            status: false,
            message: 'API Key tidak valid!'
        });
    }

    // 3. Ambil Parameter
    const url  = req.query?.url;
    const emoji = req.query?.emoji || '🔥';

    // 4. Validasi URL
    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'url' wajib diisi!"
        });
    }

    // 5. Logic
    try {
        const data = await reactToChannel(url, emoji);

        return res.status(200).json({
            status: true,
            result: {
                deviceId: data.deviceId,
                deviceKey: data.deviceKey,
                deviceName: data.deviceName,
                message: data.result?.message,
                details: data.result?.details,
                remaining: data.result?.remaining
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.response?.data?.message || error.message || 'Terjadi kesalahan!'
        });
    }
}
