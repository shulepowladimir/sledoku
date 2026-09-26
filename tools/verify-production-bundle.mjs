import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const files = await listFiles('dist');
const assetFiles = files.filter((file) => /\.(?:js|css)$/.test(file));
const bundle = (await Promise.all(assetFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const editorSourceFiles = await listFiles('src/components/editor').catch((error) => {
  if (error.code === 'ENOENT') return [];
  throw error;
});

assert.ok(files.length > 0, 'production build output is empty');
assert.equal(files.some((file) => path.basename(file) === 'editor.html'), false, 'editor page is present in dist');
assert.equal(await exists('editor.html'), false, 'editor.html remains in the active source tree');
assert.equal(await exists('src/editor-main.tsx'), false, 'editor entry remains in the active source tree');
assert.equal(editorSourceFiles.length, 0, 'editor components remain in the active source tree');
assert.equal(bundle.includes('level-editor'), false, 'editor styles are present in the production bundle');
assert.equal(bundle.includes('asset-gallery__'), false, 'gallery styles are present in the production bundle');
assert.equal(bundle.includes('gallery-items'), false, 'gallery component is present in the production bundle');

console.log('Production bundle excludes the level editor and asset gallery.');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(file) : [file];
  }));
  return nested.flat();
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
