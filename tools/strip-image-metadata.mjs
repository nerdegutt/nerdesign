// Camera metadata out of published images. A phone photo carries its GPS position to the metre, the phone model
// and the time it was taken (EXIF), and AGENTS.md «Public hygiene» allows farm photos but no addresses.
// Pixels and the colour profile (ICC) are kept byte for byte: nothing is re-encoded.
//
//   node tools/strip-image-metadata.mjs <dir|file>...           strip in place, list the files it changed
//   node tools/strip-image-metadata.mjs --check <dir|file>...   list files with metadata, exit 1 if any
//
// JPEG: drops APP1 (EXIF, XMP) and APP13 (IPTC/Photoshop) segments. PNG: drops eXIf, tEXt, iTXt, zTXt and tIME.
// A JPEG whose EXIF orientation is not «normal» is refused: without the tag it would show rotated.
// Used by test/images.spec.mjs (examples/) and tools/deploy.sh (all of nettsted/, snapshots included).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const JPEG_DROP = new Set([0xe1, 0xed]);                       // APP1, APP13
const PNG_DROP = new Set(['eXIf', 'tEXt', 'iTXt', 'zTXt', 'tIME']);
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// EXIF orientation (tag 0x0112 in IFD0) from an APP1 payload, or 1 when absent.
function exifOrientation(seg) {
  if (seg.subarray(0, 6).toString('latin1') !== 'Exif\0\0') return 1;
  const t = seg.subarray(6);
  const le = t.subarray(0, 2).toString('latin1') === 'II';
  const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o));
  const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
  const ifd = u32(4);
  for (let i = 0, n = u16(ifd); i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (u16(e) === 0x0112) return u16(e + 8);
  }
  return 1;
}

// Returns { found: [what…], out: Buffer without them } for one file.
function jpeg(buf) {
  const found = []; const parts = [buf.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buf.length && buf[i] === 0xff) {
    const marker = buf[i + 1];
    if (marker === 0xff) { i++; continue; }                     // fill byte before a marker
    if (marker === 0xda || marker === 0xd9) break;              // start of scan / end of image: the rest is image data
    const end = i + 2 + buf.readUInt16BE(i + 2);
    const seg = buf.subarray(i + 4, end);
    if (JPEG_DROP.has(marker)) {
      if (marker === 0xe1 && exifOrientation(seg) !== 1) throw new Error('EXIF orientation is not normal – rotate the pixels first');
      found.push(marker === 0xed ? 'IPTC/Photoshop' : seg.subarray(0, 4).toString('latin1') === 'Exif' ? 'EXIF' : 'XMP');
    } else parts.push(buf.subarray(i, end));
    i = end;
  }
  parts.push(buf.subarray(i));
  const out = Buffer.concat(parts);
  // Metadata after the first image (a second embedded JPEG) cannot be stripped here.
  if (out.includes('Exif\0\0') || out.includes('x:xmpmeta')) throw new Error('metadata outside the header segments');
  return { found, out };
}

function png(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error('not a PNG');
  const found = []; const parts = [PNG_SIG];
  for (let i = 8; i + 12 <= buf.length;) {
    const end = i + 12 + buf.readUInt32BE(i);
    const type = buf.subarray(i + 4, i + 8).toString('latin1');
    if (PNG_DROP.has(type)) found.push(type); else parts.push(buf.subarray(i, end));
    i = end;
  }
  return { found, out: Buffer.concat(parts) };
}

const HANDLERS = { '.jpg': jpeg, '.jpeg': jpeg, '.png': png };

function* files(path) {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path).sort()) if (!name.startsWith('.')) yield* files(join(path, name));
  } else if (HANDLERS[extname(path).toLowerCase()]) yield path;
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const paths = args.filter((a) => a !== '--check');
if (!paths.length) { console.error('usage: node tools/strip-image-metadata.mjs [--check] <dir|file>...'); process.exit(2); }

let count = 0; let errors = 0;
for (const p of paths) for (const f of files(p)) {
  try {
    const buf = readFileSync(f);
    if (!buf.length) continue;                                     // being written (a test saving a screenshot)
    const { found, out } = HANDLERS[extname(f).toLowerCase()](buf);
    if (!found.length) continue;
    count++;
    if (!check) writeFileSync(f, out);
    console.log(`${check ? 'has metadata' : 'stripped'}: ${relative(process.cwd(), f)} (${[...new Set(found)].join(', ')})`);
  } catch (err) {
    errors++;
    console.error(`${relative(process.cwd(), f)}: ${err.message}`);
  }
}
if (!check && count) console.log(`${count} image(s) stripped`);
process.exit(errors || (check && count) ? 1 : 0);
