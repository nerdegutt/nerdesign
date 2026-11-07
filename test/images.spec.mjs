// Published images carry no camera metadata: an iPhone photo has its GPS position to the metre, the phone
// model and the time it was taken (AGENTS.md «Public hygiene»). Fix with `node tools/strip-image-metadata.mjs examples`.
import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

test('example images have no EXIF, XMP or IPTC', () => {
  const r = spawnSync(process.execPath, ['tools/strip-image-metadata.mjs', '--check', 'examples'], { cwd: root, encoding: 'utf8' });
  expect(r.stdout + r.stderr, 'images with metadata').toBe('');
  expect(r.status).toBe(0);
});
