// One-time icon generator. Node built-ins only — no dependencies.
// Usage: node generate-icons.js
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Assets', 'icons');

// ---- Minimal PNG encoder (8-bit RGBA) ----
const CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
    }
    return t;
})();
const crc32 = (b) => {
    let c = 0xFFFFFFFF;
    for (const x of b) c = CRC[(c ^ x) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
};
const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
};
function png(size, rgba) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8; ihdr[9] = 6;
    const stride = size * 4 + 1;
    const raw = Buffer.alloc(stride * size);
    for (let y = 0; y < size; y++) {
        raw[y * stride] = 0;
        rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
    }
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---- Icon drawing ----
const c0 = [0x7f, 0x5a, 0xf0], c1 = [0x2c, 0xb6, 0x7d]; // indigo -> teal
const R = 0.22;            // corner radius, normalized
const TH = 0.035;          // checkmark half-thickness, normalized
const SEGS = [
    [0.27, 0.53, 0.44, 0.70],
    [0.44, 0.70, 0.74, 0.33],
];
const segDist = (px, py, ax, ay, bx, by) => {
    const abx = bx - ax, aby = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)));
    return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
};

function drawIcon(size, { radius, safe }) {
    const rgba = Buffer.alloc(size * size * 4);
    const s = safe ? 0.8 : 1, off = (1 - s) / 2; // maskable: check stays inside 80% safe zone
    const r = radius / size;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const u = x / size, v = y / size;
        const i = (y * size + x) * 4;
        let inside = true;
        if (r > 0) {
            const cu = Math.min(Math.max(u, r), 1 - r), cv = Math.min(Math.max(v, r), 1 - r);
            inside = Math.hypot(u - cu, v - cv) <= r;
        }
        if (!inside) { rgba[i + 3] = 0; continue; }
        const t = (u + v) / 2;
        for (let k = 0; k < 3; k++) rgba[i + k] = Math.round(c0[k] + (c1[k] - c0[k]) * t);
        rgba[i + 3] = 255;
        const cu = (u - off) / s, cv = (v - off) / s;
        if (Math.min(...SEGS.map(([ax, ay, bx, by]) => segDist(cu, cv, ax, ay, bx, by))) <= TH) {
            rgba[i] = rgba[i + 1] = rgba[i + 2] = 255;
        }
    }
    return png(size, rgba);
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icon-192.png'), drawIcon(192, { radius: R, safe: false }));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), drawIcon(512, { radius: R, safe: false }));
fs.writeFileSync(path.join(OUT, 'icon-maskable-512.png'), drawIcon(512, { radius: 0, safe: true }));
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), drawIcon(180, { radius: R, safe: false }));
console.log('Icons written to', OUT);
