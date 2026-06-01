/*
Name: Carbon
Base : https://carbon.now.sh
By : EpanD
Created : 01 June 2026
*/

import { Request, Response } from 'express';
import mql from '@microlink/mql';

const DEFAULT_CONFIG = {
    code: `console.log("Hello World");`,
    language: 'javascript',
    theme: 'dracula-pro',
    font: 'Fira Code',
    fontSize: '14px',
    background: 'rgba(226,233,239,1)',
    lineNumbers: true,
    width: 1024,
    height: 768,
    waitFor: 3000
};

const THEMES = [
    'dracula-pro',
    'monokai',
    'nord',
    'solarized-dark',
    'solarized-light',
    'one-dark',
    'material',
    'panda-syntax',
    'night-owl',
    'cobalt2'
];

const FONTS = [
    'Fira Code',
    'JetBrains Mono',
    'Hack',
    'Source Code Pro',
    'Inconsolata',
    'Droid Sans Mono',
    'Anonymous Pro'
];

function parseBoolean(value: unknown) {
    const val = String(value || '').toLowerCase();
    return val === 'true' || val === '1' || val === 'yes' || val === 'y';
}

function parseNumber(value: unknown, fallback: number) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function buildCarbonUrl(config: typeof DEFAULT_CONFIG) {
    const theme = THEMES.includes(config.theme) ? config.theme : 'dracula-pro';
    const font = FONTS.includes(config.font) ? config.font : 'Fira Code';

    const params = new URLSearchParams({
        bg: config.background,
        t: theme,
        wt: 'none',
        l: config.language || 'auto',
        ds: 'false',
        dsyoff: '20px',
        dsblur: '68px',
        wc: 'true',
        wa: 'true',
        pv: '56px',
        ph: '56px',
        ln: config.lineNumbers ? 'true' : 'false',
        fl: '1',
        fm: font,
        fs: config.fontSize || '14px',
        lh: '152%',
        si: 'false',
        es: '2x',
        wm: 'false'
    });

    params.append('code', config.code);

    return `https://carbon.now.sh/?${params.toString()}`;
}

async function carbon(config: typeof DEFAULT_CONFIG) {
    const targetUrl = buildCarbonUrl(config);

    const result = await mql(targetUrl, {
        screenshot: {
            element: '.export-container',
            optimizeForSpeed: true
        },
        viewport: {
            width: config.width,
            height: config.height
        },
        waitFor: config.waitFor,
        meta: false
    });

    const imageUrl = result.data?.screenshot?.url || null;
    const ok = !!imageUrl;

    return {
        Status: ok,
        Code: ok ? 200 : 500,
        Input: config.code,
        Language: config.language,
        Theme: config.theme,
        Font: config.font,
        Result_url: imageUrl,
        Error: ok ? null : result.data?.error?.message || 'Carbon screenshot failed'
    };
}

export default async function (req: Request, res: Response) {
    // 1. Ambil parameter
    const code = (req.query.code as string) || '';
    const language = (req.query.language as string) || DEFAULT_CONFIG.language;
    const theme = (req.query.theme as string) || DEFAULT_CONFIG.theme;
    const font = (req.query.font as string) || DEFAULT_CONFIG.font;
    const fontSize = (req.query.fontSize as string) || DEFAULT_CONFIG.fontSize;
    const background = (req.query.background as string) || DEFAULT_CONFIG.background;
    const lineNumbers = req.query.lineNumbers !== undefined
        ? parseBoolean(req.query.lineNumbers)
        : DEFAULT_CONFIG.lineNumbers;
    const width = parseNumber(req.query.width, DEFAULT_CONFIG.width);
    const height = parseNumber(req.query.height, DEFAULT_CONFIG.height);
    const waitFor = parseNumber(req.query.waitFor, DEFAULT_CONFIG.waitFor);

    // 2. Validasi
    if (!code) {
        return res.json({
            status: false,
            message: 'Code required!'
        });
    }

    if (theme && !THEMES.includes(theme)) {
        return res.json({
            status: false,
            message: `Invalid theme! Available: ${THEMES.join(', ')}`
        });
    }

    if (font && !FONTS.includes(font)) {
        return res.json({
            status: false,
            message: `Invalid font! Available: ${FONTS.join(', ')}`
        });
    }

    if (width <= 0 || height <= 0 || waitFor < 0) {
        return res.json({
            status: false,
            message: 'Width, height, and waitFor must be valid numbers!'
        });
    }

    // 3. Logic & Response
    try {
        const result = await carbon({
            code,
            language,
            theme,
            font,
            fontSize,
            background,
            lineNumbers,
            width,
            height,
            waitFor
        });

        if (!result.Status) {
            return res.json({
                status: false,
                message: result.Error || 'Failed to generate carbon image',
                result
            });
        }

        res.json({
            status: true,
            result
        });
    } catch (error: any) {
        res.json({
            status: false,
            message: error.message || 'An error occurred'
        });
    }
}