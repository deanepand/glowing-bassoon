/*
Name: Sharpify - Upscale, enhance, removebg
Base : https://play.google.com/store/apps/details?id=com.raahim2.Sharpify
By : EpanD
Created : 01 June 2026
*/

import { Request, Response } from 'express';

const headers = {
    'User-Agent': 'okhttp/4.9.2',
    'Accept-Encoding': 'gzip'
};

const listmodel: Record<string, string> = {
    enhance: 'https://sharpify-api.vercel.app/api/enhance/auto_enhance',
    upscale: 'https://sharpify-api.vercel.app/api/enhance/upscale',
    removebg: 'https://sharpify-api.vercel.app/api/enhance/bgrem'
};

async function sharpify(imageUrl: string, model: string) {
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) throw new Error('Failed to fetch image from URL');

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const form = new FormData();
    const blob = new Blob([buffer], {
        type: imageRes.headers.get('content-type') || 'image/jpeg'
    });

    form.append('file', blob, 'source.jpg');

    const res = await fetch(listmodel[model], {
        method: 'POST',
        headers,
        body: form
    });

    const data = await res.json();
    return data;
}

export default async function (req: Request, res: Response) {

    const { url, model } = req.query;

    if (!url) return res.json({ status: false, message: "URL required!" });
    if (!model) return res.json({ status: false, message: "Model required!" });

    if (!listmodel[model as string]) {
        return res.json({
            status: false,
            message: "Invalid model! Available: enhance, upscale, removebg"
        });
    }

    try {
        const data = await sharpify(url as string, model as string);

        res.json({
            status: true,
            result: data
        });
    } catch (error: any) {
        res.json({
            status: false,
            message: error.message || "An error occurred"
        });
    }
}