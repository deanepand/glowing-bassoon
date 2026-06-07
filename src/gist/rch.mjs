import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://react-channelwa.vercel.app/api';
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36';

function generateDeviceId(): string {
    return crypto.randomBytes(16).toString('hex');
}

async function reactToChannel(postUrl: string, emoji: string = '🔥') {
    const deviceId = generateDeviceId();
    const deviceName = `Device-${Math.floor(Math.random() * 9000) + 1000}`;

    // Step 1: Register device baru
    const regRes = await axios.post(`${BASE_URL}/register-device`, {
        deviceId: deviceId,
        name: deviceName
    }, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': UA,
            'Origin': 'https://react-channelwa.vercel.app',
            'Referer': 'https://react-channelwa.vercel.app/'
        }
    });

    const deviceKey = regRes.data?.deviceKey;
    if (!deviceKey) throw new Error('Gagal register device');

    // Step 2: Inject reaksi
    const injRes = await axios.post(`${BASE_URL}/inject`, {
        deviceKey: deviceKey,
        url: postUrl,
        emojis: emoji
    }, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': UA,
            'Origin': 'https://react-channelwa.vercel.app',
            'Referer': 'https://react-channelwa.vercel.app/'
        }
    });

    return {
        deviceId: deviceId,
        deviceKey: deviceKey,
        deviceName: deviceName,
        result: injRes.data
    };
}

export default async function (req: Request, res: Response) {
    // 1. Ambil parameter
    const { url, emoji } = req.query;

    // 2. Validasi
    if (!url) return res.json({ 
        status: false, 
        message: "Parameter 'url' wajib diisi!" 
    });

    // 3. Logic
    try {
        const data = await reactToChannel(
            url as string,
            (emoji as string) || '🔥'
        );

        // 4. Response
        return res.json({
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

    } catch (error: any) {
        return res.json({
            status: false,
            message: error.response?.data?.message || error.message || "Terjadi kesalahan!"
        });
    }
};
